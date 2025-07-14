---
title: Configurer Argo CD dans un cluster k3s
description: Aujourd'hui, nous allons voir comment configurer Argo CD dans un cluster k3s.
date: 2024-07-27
lastUpdated: 2024-07-28
tags:
  - Automation
  - Deployment
excerpt: "Pour améliorer davantage notre cluster k3s, et plus particulièrement
  le workflow CI/CD, nous allons nous pencher sur l'outil GitOps nommé <a
  class=\"gh-badge\" href=\"https://github.com/argoproj\"><img
  src=\"https://github.com/argoproj.png\" alt=\"Argo CD\" width=\"16\"
  height=\"16\"
  style=\"border-radius:9999px;vertical-align:middle;margin-right:0.4em;\"
  />Argo CD</a> et découvrir comment l'intégrer dans notre cluster. Notre stack
  technologique pour le déploiement utilise les services suivants : k3s, Helm,
  Cilium, et avec ce tutoriel, également Argo CD."
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Argo CD"
  image: ../../../../../../public/blog/setup-argocd-for-kubernetes.png

---

Après avoir lu l'article de Vegard S. Hagen “[Argo CD Kustomize with Helm](https://blog.stonegarden.dev/articles/2023/09/argocd-kustomize-with-helm/)” et décidé que leur solution ne convenait pas à notre cluster, nous nous sommes lancés directement dans le guide standard “[Getting started](https://argo-cd.readthedocs.io/en/stable/getting_started/)” d'Argo CD. Nous vous guidons maintenant à travers les défis liés à la configuration de [Argo CD](https://github.com/argoproj) sur [k3s](https://github.com/k3s-io) et [Cilium](https://github.com/cilium), basé sur le chapitre “[Setup Certificate Manager with Cloudflare](../../blog/setup-kubernetes-with-cilium-and-cloudflare#setup-certificate-manager-with-cloudflare/)” de notre récent article “[Setting up Kubernetes with Cilium and Cloudflare](../../blog/setup-kubernetes-with-cilium-and-cloudflare/)”. Dans ce même article récent, nous avons également configuré [Keel](https://github.com/keel-hq) à la fin, mais cette étape devient maintenant superflue puisque nous utilisons Argo CD pour obtenir les dernières mises à jour depuis n'importe quel dépôt [GitHub](https://github.com/github). Bonne lecture !

:::note
Nous supposons que vous avez suivi [notre autre article de blog](../../blog/setup-kubernetes-with-cilium-and-cloudflare/).
:::

## Exigences

Avant de commencer, nous devons nous assurer que `kubectl` est installé, qu'un fichier kubeconfig est disponible (k3s stocke ce fichier ici :

```yaml
#/etc/rancher/k3s/config.yaml
flannel-backend: "none"
disable-kube-proxy: true
disable-network-policy: true
cluster-init: true
disable:
    - servicelb
    - traefik
```

) et CoreDNS (vérifiez si vous disposez de CoreDNS en exécutant cette commande

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

).

## Installation

Tout d'abord, nous appliquons tous les services nécessaires, les déploiements et diverses autres ressources Kubernetes en exécutant :

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Certificat

De plus, nous avons besoin d'un certificat :

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
    name: argocd
    namespace: argocd
spec:
    secretName: argocd
    issuerRef:
        name: acme-issuer
        kind: ClusterIssuer
    dnsNames:
        - "argo-cd.trueberryless.org"
```

Appliquez cette ressource en exécutant `kubectl apply -f certificate.yaml`.

## Contrôleur Ingress

En outre, nous avons besoin d'un contrôleur Ingress géré par Cilium :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: argocd-ingress
    namespace: argocd
spec:
    rules:
        - host: argo-cd.trueberryless.org
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: argocd-server
                            port:
                                number: 80

    tls:
        - hosts:
              - argo-cd.trueberryless.org
          secretName: argocd
```

Appliquez cette ressource en exécutant `kubectl apply -f argocd-ingress.yaml`.

## Désactivation de TSL au sein d'Argo CD

Avec le certificat, la connexion entre le client et le serveur est sécurisée. Cependant, au sein des services [Argo CD](https://github.com/argoproj), il existe encore un certificat auto-signé dont nous n'avons pas forcément besoin. Nous pouvons donc désactiver la fonction de sécurité du serveur Argo CD en modifiant la propriété `server.insecure`.

Pour ce faire, commencez par exécuter cette commande :

```bash
kubectl edit cm argocd-cmd-params-cm -n argocd
```

cela devrait idéalement ouvrir un fichier dans vim ou neovim (ce serait embarrassant si ce n'était pas le cas, LOL). Le fichier devrait ressembler à ceci :

```yaml {21-22}
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
data:
    server.insecure: "true"
kind: ConfigMap
metadata:
    annotations:
        kubectl.kubernetes.io/last-applied-configuration: |
            {"apiVersion":"v1","kind":"ConfigMap","metadata":{"annotations":{},"labels":{"app.kubernetes.io/name":"argocd-cmd-params-cm","app.kubernetes.io/part-of":"argocd"},"name":"arg
    creationTimestamp: "2024-07-27T11:15:28Z"
    labels:
        app.kubernetes.io/name: argocd-cmd-params-cm
        app.kubernetes.io/part-of: argocd
    name: argocd-cmd-params-cm
    namespace: argocd
    resourceVersion: "239710156"
    uid: 5f53d26b-3adf-4ed9-9807-c3da847335a2
data:
    server.insecure: "true"
```

Les deux dernières lignes ne sont probablement pas initialement présentes, mais c'est exactement ce réglage que nous cherchons à obtenir. Ajoutez ces deux lignes (marquées ci-dessus) et enregistrez le fichier (`Esc` → `:wq` si vous êtes cool).

Redémarrez le serveur Argo CD en exécutant les commandes suivantes, puis attendez que le déploiement soit terminé :

```bash
kubectl rollout restart deploy argocd-server -n argocd
kubectl rollout status deploy argocd-server -n argocd
```

Après toutes ces étapes, nous devrions maintenant voir l'interface utilisateur à [`https://argo-cd.trueberryless.org`](https://argo-cd.trueberryless.org) (protégée par mot de passe).

![Argo CD UI Dashboard](../../../../../assets/argocd/argocd_ui_dashboard.png)

:::note
Les informations d'identification pour l'interface utilisateur d'Argo CD se composent d'un nom d'utilisateur et d'un mot de passe. Le nom d'utilisateur est toujours `admin` et pour récupérer votre mot de passe, exécutez la commande suivante :

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```
:::

## Ajouter le manifeste au dépôt

Pour créer une nouvelle application dans [Argo CD](https://github.com/argoproj) (soit via l'interface, soit via la CLI — nous utilisons l'interface car nous n'avons pas configuré la CLI), nous devons préparer le dépôt Git. Étant donné que le dépôt est la seule source de vérité, nous définissons ici toutes les ressources Kubernetes qui doivent être créées par Argo CD.

Nous recommandons de créer un nouveau dossier dans le dépôt Git qui sera appelé quelque chose comme `manifest`. Dans ce dossier, nous créons plusieurs fichiers :

* `certificate.yaml` :

  ```yaml
  apiVersion: cert-manager.io/v1
  kind: Certificate
  metadata:
  name: mutanuq
  namespace: mutanuq
  spec:
  secretName: mutanuq
  issuerRef:
      name: acme-issuer
      kind: ClusterIssuer
  dnsNames:
      - "mutanuq.trueberryless.org"
  ```

* `deployment.yaml` :

  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
      name: mutanuq
      namespace: mutanuq
      labels:
          app: mutanuq
  spec:
      replicas: 3
      selector:
          matchLabels:
              app: mutanuq
      template:
          metadata:
              labels:
                  app: mutanuq
          spec:
              containers:
                  - name: mutanuq
                  image: "trueberryless/mutanuq"
                  imagePullPolicy: Always
  ```

* `service.yaml` :

  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
  name: mutanuq
  namespace: mutanuq
  annotations:
      cert-manager.io/issuer: acme-issuer
  spec:
  selector:
      app: mutanuq
  ports:
      - name: http
      port: 80
  ```

* `ingress.yaml` :

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
  name: mutanuq
  namespace: mutanuq
  spec:
  rules:
      - host: mutanuq.trueberryless.org
      http:
          paths:
          - path: /
              pathType: Prefix
              backend:
              service:
                  name: mutanuq
                  port:
                  number: 80

  tls:
  - hosts:
      - mutanuq.trueberryless.org
      secretName: mutanuq
  ```

Ces fichiers sont fondamentalement les mêmes que ceux mentionnés dans [l'autre article](../../blog/setup-kubernetes-with-cilium-and-cloudflare#example-app-mutanuq/), mais répartis sur quatre fichiers, car cela nous permet de manipuler le manifeste depuis [GitHub](https://github.com/github) Actions. Mais une chose à la fois : vous verrez comment le manifeste est configuré avec GitHub Actions dans [notre prochain article](../../blog/setup-continuous-integration-github-repository/).

## Créer une nouvelle application dans l'interface d'Argo CD

Vous verrez probablement le grand bouton `NEW APP` dans l'interface de [Argo CD](https://github.com/argoproj). Cliquez dessus et créez une nouvelle application avec les propriétés adaptées ci-dessous :

* Nom de l'application : `mutanuq`
* Nom du projet : `default`
* Politique de synchronisation : Plus d'informations dans [cet article](../../blog/setup-continuous-integration-github-repository/) / laissez-la pour l'instant sur `Manual`
* URL du dépôt : `https://github.com/trueberryless-org/mutanuq`
* Révision : `HEAD`
* Chemin : `manifest`
* URL du cluster : `https://kubernetes.default.svc`
* Espace de noms : `mutanuq`

Optionnel — si vous avez [installé le CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/) — vous pouvez exécuter cette commande pour obtenir le même résultat :

```bash
argocd app create mutanuq \
  --project default \
  --repo https://github.com/trueberryless-org/mutanuq \
  --revision HEAD \
  --path manifest \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace mutanuq
```

Vous devriez maintenant voir votre site Web déployé dans l'interface utilisateur. Ce processus peut prendre un certain temps, notamment parce que la demande de certificat doit être approuvée. Une application saine devrait ressembler à ceci :

![Argo CD Example Application UI](../../../../../assets/argocd/argocd_example_application_ui.png)

## Célébrez avec un café !

Félicitations, vous avez configuré avec succès [Argo CD](https://github.com/argoproj) sur un cluster [k3s](https://github.com/k3s-io) ! Vous avez mérité une pause café. Savourez une tasse bien méritée, et si vous souhaitez m'offrir un café virtuel, n'hésitez pas à soutenir mon travail sur [Ko-fi](https://ko-fi.com/trueberryless). Merci beaucoup !

## Poursuite

Suite dans notre [prochain blog](../../blog/setup-continuous-integration-github-repository/), qui décrit comment configurer un dépôt [GitHub](https://github.com/github) pouvant ensuite être déployé via Argo CD.
