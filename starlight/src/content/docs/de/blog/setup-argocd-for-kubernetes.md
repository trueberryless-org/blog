---
title: Einrichten von Argo CD in einem k3s-Cluster
description: Heute werfen wir einen Blick darauf, wie man Argo CD in einem
  k3s-Cluster einrichtet.
date: 2024-07-27
lastUpdated: 2024-07-28
tags:
  - Automation
  - Deployment
excerpt: Um unser k3s-Cluster und insbesondere den CI/CD-Workflow weiter zu
  verbessern, schauen wir uns nun das GitOps-Tool <a class="gh-badge"
  href="https://github.com/argoproj"><img src="https://github.com/argoproj.png"
  alt="Argo CD" />Argo CD</a> an und wie wir es in unser Cluster integrieren
  können. Unser Technologiestack für die Bereitstellung umfasst folgende
  Dienste&#58; k3s, Helm, Cilium & nach diesem Tutorial auch Argo CD.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Argo CD"
  image: ../../../../../public/blog/setup-argocd-for-kubernetes.png

---

Nachdem wir Vegard S. Hagens Artikel “[Argo CD Kustomize with Helm](https://blog.stonegarden.dev/articles/2023/09/argocd-kustomize-with-helm/)” gelesen und entschieden haben, dass ihre Lösung nicht für unser Cluster geeignet ist, haben wir uns direkt in den Argo CD-Standardleitfaden “[Getting started](https://argo-cd.readthedocs.io/en/stable/getting_started/)” gestürzt. Jetzt führen wir Euch durch den Einrichtungsvorgang von [Argo CD](https://github.com/argoproj) auf [k3s](https://github.com/k3s-io) und [Cilium](https://github.com/cilium), ausgehend vom Kapitel “[Setup Certificate Manager with Cloudflare](../../blog/setup-kubernetes-with-cilium-and-cloudflare#setup-certificate-manager-with-cloudflare/)” unseres neuesten Beitrags “[Setting up Kubernetes with Cilium and Cloudflare](../../blog/setup-kubernetes-with-cilium-and-cloudflare/)”. In genau diesem kürzlichen Beitrag haben wir auch [Keel](https://github.com/keel-hq) am Ende aufgesetzt, aber dieser Schritt wird jetzt überflüssig, da wir Argo CD verwenden, um den neuesten Stand der Technik aus jedem [GitHub](https://github.com/github)-Repository zu beziehen. Viel Spaß beim Lesen!

:::note
Wir gehen davon aus, dass Ihr [unseren anderen Blogbeitrag](../../blog/setup-kubernetes-with-cilium-and-cloudflare/) befolgt habt.
:::

## Anforderungen

Bevor wir beginnen können, müssen wir sicherstellen, dass `kubectl` installiert ist, wir eine Kubeconfig-Datei haben (k3s speichert diese Datei hier:

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

) und CoreDNS (überprüft, ob CoreDNS vorhanden ist, indem Ihr diesen

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

Befehl ausführt).

## Installation

Zuerst wenden wir alle notwendigen Dienste, Deployments und viele andere verschiedene Kubernetes-Ressourcen an, indem wir Folgendes ausführen:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Zertifikat

Zusätzlich benötigen wir ein Zertifikat:

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

Wendet diese Ressource an, indem Ihr `kubectl apply -f certificate.yaml` ausführt.

## Ingress-Controller

Außerdem benötigen wir einen Ingress-Controller, der von Cilium verwaltet wird:

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

Wendet diese Ressource an, indem Ihr `kubectl apply -f argocd-ingress.yaml` ausführt.

## Deaktivieren von TSL in Argo CD

Mit dem Zertifikat ist die Verbindung zwischen dem Client und dem Server gesichert. Allerdings gibt es immer noch ein selbstsigniertes Zertifikat innerhalb der [Argo CD](https://github.com/argoproj)-Dienste, das wir nicht unbedingt benötigen. Wir können daher die Sicherheit des Argo CD-Servers deaktivieren, indem wir die Eigenschaft `server.insecure` bearbeiten.

Um dies zu tun, führen wir zuerst diesen Befehl aus:

```bash
kubectl edit cm argocd-cmd-params-cm -n argocd
```

der hoffentlich eine Datei in vim oder neovim öffnet (alles andere wäre aus unserer Sicht unangenehm, LOL). Die Datei sollte wie folgt aussehen:

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

Die letzten beiden Zeilen werden wahrscheinlich zunächst nicht vorhanden sein, aber genau diese Einstellung möchten wir erreichen. Fügt diese beiden Zeilen (oben markiert) hinzu und speichert die Datei (`Esc` → `:wq`, wenn Ihr cool seid).

Startet den Argo CD-Server neu, indem Ihr diesen Befehl ausführt, und wartet, bis der Rollout abgeschlossen ist:

```bash
kubectl rollout restart deploy argocd-server -n argocd
kubectl rollout status deploy argocd-server -n argocd
```

Nach all diesen Schritten sollten wir die Benutzeroberfläche unter [`https://argo-cd.trueberryless.org`](https://argo-cd.trueberryless.org) sehen (passwortgeschützt).

![Argo CD UI-Dashboard](../../../../../assets/argocd/argocd_ui_dashboard.png)

:::note
Die Anmeldedaten der Argo CD-Benutzeroberfläche bestehen aus einem Benutzer und einem Passwort. Der Benutzer ist immer `admin`, und Ihr könnt Euer Passwort abrufen, indem Ihr Folgendes ausführt:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```
:::

## Manifest zum Repository hinzufügen

Um in [Argo CD](https://github.com/argoproj) eine neue Anwendung zu erstellen (entweder über die Benutzeroberfläche oder die CLI — wir verwenden die Benutzeroberfläche, da wir die CLI nicht eingerichtet haben), müssen wir das Git-Repository vorbereiten. Weil das Repository die einzige Quelle der Wahrheit ist, definieren wir hier auch alle Kubernetes-Ressourcen, die von Argo CD erstellt werden sollen.

Wir empfehlen, einen neuen Ordner im Git-Repository zu erstellen, der etwas wie `manifest` heißt. In diesem Ordner legen wir ein paar Dateien an:

* `certificate.yaml`:

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

* `deployment.yaml`:

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

* `service.yaml`:

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

* `ingress.yaml`:

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

Diese Dateien sind im Grunde die gleichen Dateien, die im [anderen Beitrag](../../blog/setup-kubernetes-with-cilium-and-cloudflare#example-app-mutanuq/) erwähnt wurden, jedoch in vier Dateien aufgeteilt, da dies uns den Vorteil gibt, das Manifest von [GitHub](https://github.com/github) Actions aus zu manipulieren. Aber der Reihe nach, im [nächsten Beitrag](../../blog/setup-continuous-integration-github-repository/) erfahrt Ihr, wie Ihr das Manifest mit GitHub Actions einrichtet.

## Neue Anwendung in der Argo CD-Benutzeroberfläche erstellen

Ihr werdet wahrscheinlich den großen `NEW APP`-Button in der Benutzeroberfläche von [Argo CD](https://github.com/argoproj) sehen. Klickt darauf und erstellt eine neue Anwendung mit den folgenden angepassten Eigenschaften:

* Anwendungsname: `mutanuq`
* Projektname: `default`
* Sync-Policy: Mehr darüber erfahrt Ihr in [diesem Beitrag](../../blog/setup-continuous-integration-github-repository/) / lasst es vorerst auf `Manuell`
* Repository-URL: `https://github.com/trueberryless-org/mutanuq`
* Revision: `HEAD`
* Pfad: `manifest`
* Cluster-URL: `https://kubernetes.default.svc`
* Namespace: `mutanuq`

Optional — wenn Ihr [die CLI installiert habt](https://argo-cd.readthedocs.io/en/stable/cli_installation/) — könnt Ihr diesen Befehl für denselben Output ausführen:

```bash
argocd app create mutanuq \
  --project default \
  --repo https://github.com/trueberryless-org/mutanuq \
  --revision HEAD \
  --path manifest \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace mutanuq
```

Nun sollten Sie hoffentlich sehen, dass Ihre Website in der Benutzeroberfläche bereitgestellt wird. Dieser Vorgang kann einige Zeit in Anspruch nehmen, da beispielsweise die Zertifikatsanforderung genehmigt werden muss. Eine gesunde Anwendung sollte in etwa so aussehen:

![Argo CD Beispiel-Anwendungs-UI](../../../../../assets/argocd/argocd_example_application_ui.png)

## Mit einem Kaffee feiern!

Herzlichen Glückwunsch, Sie haben [Argo CD](https://github.com/argoproj) erfolgreich auf einem [k3s](https://github.com/k3s-io)-Cluster eingerichtet! Sie haben sich eine Kaffeepause verdient. Genießen Sie eine wohlverdiente Tasse, und wenn Sie mir virtuell einen Kaffee ausgeben möchten, können Sie gerne meine Arbeit auf [Ko-fi](https://ko-fi.com/trueberryless) unterstützen. Vielen Dank!

## Fortsetzung

Bleiben Sie dran für unseren [nächsten Blog](../../blog/setup-continuous-integration-github-repository/), in dem beschrieben wird, wie Sie ein [GitHub](https://github.com/github)-Repository einrichten, das anschließend über Argo CD bereitgestellt werden kann.
