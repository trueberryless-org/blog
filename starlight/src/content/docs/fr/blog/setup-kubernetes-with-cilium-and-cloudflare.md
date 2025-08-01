---
title: Configuration de Kubernetes avec Cilium et Cloudflare
description: Aujourd'hui, nous allons voir comment configurer un cluster
  Kubernetes avec K3s et Cilium.
date: 2024-06-11
lastUpdated: 2024-10-01
tags:
  - Deployment
excerpt: Cet article de blog décrit le processus de création d'un cluster <a
  class="gh-badge" href="https://github.com/kubernetes"><img
  src="https://github.com/kubernetes.png" alt="Kubernetes" />Kubernetes</a> avec
  <a class="gh-badge" href="https://github.com/k3s-io"><img
  src="https://github.com/k3s-io.png" alt="k3s" />k3s</a> et <a class="gh-badge"
  href="https://github.com/cilium"><img src="https://github.com/cilium.png"
  alt="Cilium" />Cilium</a>. Nous utilisons <a class="gh-badge"
  href="https://github.com/helm"><img src="https://github.com/helm.png"
  alt="Helm" />Helm</a> comme gestionnaire de paquets et <a class="gh-badge"
  href="https://github.com/cloudflare"><img
  src="https://github.com/cloudflare.png" alt="Cloudflare" />Cloudflare</a>
  comme émetteur de certificats. Nous avons utilisé les astuces et conseils de
  Vegard S. Hagen tirés de [son
  article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/).
  Essentiellement, ce blog explique comment tous les sites web trueberryless.org
  étaient déployés (plus maintenant).
authors:
  - trueberryless
  - clemens
cover:
  alt: A beautiful cover image with the text "Kubernetes"
  image: ../../../../../public/blog/setup-kubernetes-with-cilium-and-cloudflare.png
metrics:
  readingTime: 360
  words: 1099

---

Travailler avec des conteneurs [Docker](https://github.com/docker) peut être difficile. Cependant, il existe des outils qui améliorent la gestion des conteneurs, comme [Kubernetes](https://github.com/kubernetes). En fait, Kubernetes est le seul outil à ma connaissance qui agit comme un logiciel de gestion pour les conteneurs Docker. Kubernetes est bien intégré dans presque tous les fournisseurs de cloud, comme Google Cloud, Azure et AWS. En conséquence, il possède une syntaxe standardisée en `yaml`, ce qui est idéal pour les petits développeurs car ils peuvent basculer entre les "Big Three" avec peu d'effort.

## en bref

Installez tout puis appliquez cert-manager. facile

```bash
curl -sfL https://get.k3s.io | sh -s - \
  --flannel-backend=none \
  --disable-kube-proxy \
  --disable servicelb \
  --disable-network-policy \
  --disable traefik \
  --cluster-init

curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

helm repo add cilium https://helm.cilium.io/
helm repo update
helm install cilium cilium/cilium

CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz

cilium install \
  --set k8sServiceHost=${API_SERVER_IP} \
  --set k8sServicePort=6443 \
  --set kubeProxyReplacement=true

cilium status --wait

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set crds.enabled=true
```

```yaml
# cert-manager.yaml
# secret-cloudflare.yaml
apiVersion: v1
kind: Secret
metadata:
    name: cloudflare-api-key-secret
    namespace: cert-manager
type: Opaque
stringData:
    api-key: <Cloudflare API Token (not encrypted)>
---
# cert-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
    name: acme-issuer
    namespace: cert-manager
spec:
    acme:
        email: <Email for updates>
        server: https://acme-v02.api.letsencrypt.org/directory
        privateKeySecretRef:
            name: acme-issuer
        solvers:
            - dns01:
                  cloudflare:
                      email: <Cloudflare account Email>
                      apiTokenSecretRef:
                          name: cloudflare-api-token-secret
                          key: api-token
```

## Installer k3s

Comme Hagen l'explique dans [son article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/), nous voulons installer `k3s` sans configurations, avec tout désactivé. Il décrit en détail quels composants ne sont pas installés.

```bash
curl -sfL https://get.k3s.io | sh -s - \
  --flannel-backend=none \
  --disable-kube-proxy \
  --disable servicelb \
  --disable-network-policy \
  --disable traefik \
  --cluster-init
```

Après l'installation, quelques pods devraient être en cours d'exécution (3). Ne soyez pas choqué si les pods sont dans l'état `ContainerCreating` ou `Pending`. Cela est dû au fait que les pods ne peuvent pas communiquer entre eux puisque nous avons désactivé le CNI (`--flannel-backend=none`). Nous installerons plus tard [Cilium](https://github.com/cilium), qui remplacera le CNI Flannel.

```bash
kubectl get pods -A
```

## Installer Helm

Helm est le gestionnaire de paquets pour [Kubernetes](https://github.com/kubernetes), vous devriez donc soit l'installer directement (suivez la [documentation Helm](https://helm.sh/docs/intro/install/)) soit utiliser les parties de Helm fournies avec Cilium. Nous avons choisi d'installer Helm directement, ce qui est facilement possible avec cette commande :

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## Installer Cilium

[Cilium](https://github.com/cilium) est un logiciel de réseau et de sécurité pour Kubernetes. Cilium est très rapide, évolutif et sécurisé car il est construit sur eBPF -- une technologie révolutionnaire qui peut exécuter des programmes sandboxés dans le noyau Linux sans recompiler le noyau ou charger des modules du noyau.

Nous pourrions installer Cilium avec Helm comme indiqué ici :

```bash
helm repo add cilium https://helm.cilium.io/
helm repo update
helm install cilium cilium/cilium
```

Cependant, nous avons voulu l'installer avec leur CLI et voici comment vous pouvez le faire. Tout d'abord, installez le CLI de Cilium en exécutant cet extrait de code :

```bash
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz
```

Ensuite, vous pouvez installer Cilium avec l'adresse IP de votre serveur :

```bash
cilium install \
  --set k8sServiceHost=${API_SERVER_IP} \
  --set k8sServicePort=6443 \
  --set kubeProxyReplacement=true
```

Nous attendons maintenant que Cilium indique que tout est `OK` ou `disabled` :

```bash
cilium status --wait
```

Après un certain temps, tous les pods devraient être en état `Running`.

```bash
kubectl get pods -A
```

En dernier lieu, vous pouvez appliquer certaines ressources pour Cilium :

```yaml
# announce.yaml
apiVersion: cilium.io/v2alpha1
kind: CiliumL2AnnouncementPolicy
metadata:
    name: default-l2-announcement-policy
    namespace: kube-system
spec:
    externalIPs: true
    loadBalancerIPs: true
```

```yaml
# ip-pool.yaml
apiVersion: "cilium.io/v2alpha1"
kind: CiliumLoadBalancerIPPool
metadata:
    name: "first-pool"
spec:
    blocks:
        - start: "192.168.0.240"
          stop: "192.168.0.249"
```

De plus, vous devriez mettre à jour la configuration de Cilium. Pour ce faire avec les valeurs appropriées, commencez par créer ce fichier dans le répertoire racine où vous souhaitez gérer le cluster k3s. Plus tard, vous pourriez également appliquer certaines propriétés liées à Hubble et Prometheus si vous souhaitez utiliser [Grafana](https://github.com/Grafana) ou un autre outil similaire (ouvrez les lignes repliées si vous voulez utiliser aussi notre configuration).

```yaml collapse={32-59}
#cilium-config.yaml
k8sServiceHost: 127.0.0.1
k8sServicePort: 6443

kubeProxyReplacement: true
l2announcements:
    enabled: true

externalIPs:
    enabled: true

k8sClientRateLimit:
    qps: 50
    burst: 200

operator:
    replicas: 1
    rollOutPods: true
    prometheus:
        enabled: true

rollOutCiliumPods: true

ingressController:
    enabled: true
    default: true
    loadbalancerMode: shared
    service:
        annotations:
            io.cilium/lb-ipam-ips: 192.168.0.240

hubble:
    relay:
        enabled: true
    ui:
        enabled: true
    metrics:
        serviceMonitor:
            enabled: true
        enableOpenMetrics: true
        enabled:
            - dns
            - drop
            - tcp
            - icmp
            - port-distribution
            - "flow:sourceContext=workload-name|reserved-identity;destinationContext=workload-name|reserved-identity"
            - "kafka:labelsContext=source_namespace,source_workload,destination_namespace,destination_workload,traffic_direction;sourceContext=workload-name|reserved-identity;destinationContext=workload-name|reserved-identity"
            - "httpV2:exemplars=true;labelsContext=source_ip,source_namespace,source_workload,destination_ip,destination_namespace,destination_workload,traffic_direction;sourceContext=workload-name|reserved-identity;destinationContext=workload-name|reserved-identity"
        dashboards:
            enabled: true
            namespace: monitoring
            annotations:
                grafana_folder: "Hubble"

prometheus:
    enabled: true
    serviceMonitor:
        enabled: true
```

Exécutez cette commande pour effectuer la mise à jour :

```bash
cilium upgrade -f cilium-config.yaml
```

## Configurer le gestionnaire de certificats avec Cloudflare

Pour pouvoir créer des certificats pour chaque sous-domaine, il est important d'appliquer un émetteur de certificats qui gère les demandes et les résout auprès d'un fournisseur. Nous avons choisi [Cloudflare](https://github.com/cloudflare) comme émetteur et voici la configuration que vous devez appliquer à votre cluster Kubernetes. Pour plus d'informations, vous pouvez consulter la [documentation de cert-manager](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/).

Mais d'abord, nous devons installer le cert-manager en exécutant la commande suivante :

```bash
helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set crds.enabled=true
```

```yaml
# cert-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
    name: acme-issuer
    namespace: cert-manager
spec:
    acme:
        email: <Email for updates>
        server: https://acme-v02.api.letsencrypt.org/directory
        privateKeySecretRef:
            name: acme-issuer
        solvers:
            - dns01:
                  cloudflare:
                      email: <Cloudflare account Email>
                      apiTokenSecretRef:
                          name: cloudflare-api-token-secret
                          key: api-token
```

Vous pouvez appliquer un fichier au cluster [Kubernetes](https://github.com/kubernetes) en exécutant cette commande k8s (également k3s) :

```bash
kubectl apply -f cluster-issuer.yaml
```

Si vous souhaitez supprimer la ressource dans le cluster Kubernetes, la commande est assez simple :

```bash
kubectl delete -f cluster-issuer.yaml
```

Comme vous l'avez peut-être remarqué ci-dessus, nous avons également besoin d'un secret pour le jeton API qui authentifie cet émetteur comme étant autorisé à demander des certificats. Par conséquent, nous créons un secret avec un `API Token` non chiffré de Cloudflare.

De nos jours, nous créons un jeton en accédant à votre tableau de bord [Cloudflare](https://github.com/cloudflare), puis en cliquant sur votre profil et en sélectionnant l'onglet `API Tokens`. Ici, vous pouvez générer un jeton spécifique pour votre émetteur ou utiliser la clé API globale (plus recommandé). La solution recommandée est de créer un jeton API avec deux permissions (jeton personnalisé) :

* Zone - DNS - Modifier
* Zone - Zone - Lire

![Cloudflare API Token](../../../../assets/cloudflare/cloudflare_api_token.png)

Une description plus détaillée des jetons peut être trouvée dans la [documentation Cloudflare](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

Après avoir appliqué ce secret à Kubernetes, l'émetteur devrait être prêt à résoudre certains problèmes !

```yaml
# secret-cloudflare.yaml
apiVersion: v1
kind: Secret
metadata:
    name: cloudflare-api-key-secret
    namespace: cert-manager
type: Opaque
stringData:
    api-key: <Cloudflare API Token (not encrypted)>
```

Vous pouvez maintenant utiliser cet émetteur en appliquant ce fichier qui, espérons-le, créera un certificat :

```yaml
# mutanuq-certificat.yaml
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

Cela prend généralement environ 90 secondes pour authentifier la demande une fois appliquée. Vous pouvez vérifier l'état actuel de la demande en exécutant cette commande Kubernetes. Si cela prend plus de 2 minutes, peut-être que quelques conseils dans [#Troubleshooting](#no-cloudflare-certificate-approval) peuvent vous aider.

```bash
kubectl describe certificaterequests.cert-manager.io -n mutanuq
```

:::tip
L'option `-n` correspond à l'espace de noms.
:::

## Exemple d'application [`mutanuq`](https://mutanuq.trueberryless.org)

Ensuite, vous pouvez utiliser ce certificat dans votre contrôleur Ingress :

```yaml collapse={1-42} {61-64}
# mutanuq.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: mutanuq
    namespace: mutanuq
    labels:
        app: mutanuq
    annotations:
        keel.sh/policy: all
        keel.sh/trigger: poll
        keel.sh/pollSchedule: "@every 10s"
        keel.sh/releaseNotes: "https://github.com/trueberryless-org/mutanuq/releases"
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
                  image: trueberryless/mutanuq
                  imagePullPolicy: Always
---
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
---
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

## Configurer Keel

Nous avons toujours voulu une solution propre d'Intégration Continue (CI) et de Livraison Continue (CD) pour nos sites web. Cela signifie qu'un message de commit spécifique devrait déclencher un processus automatisé sur [GitHub](https://github.com/github), Docker Hub et notre serveur, ce qui, au final, met à jour le site correspondant après environ deux minutes.

Keel est un outil logiciel robuste qui active cette fonctionnalité pour Kubernetes. Nous avons utilisé Keel pour tirer de nouvelles images Docker depuis Docker Hub par un sondage toutes les quelques minutes. De plus, Keel offre un superbe tableau de bord où vous pouvez également contrôler les sondages.

Pour configurer Keel avec le tableau de bord administrateur, nous avons créé les fichiers suivants :

* `secret-dashboard.yaml` pour le nom d'utilisateur et le mot de passe administrateur (tout le monde ne devrait pas pouvoir accéder au tableau de bord)
* `keel.yaml` pour les configurations k3s réelles (copiées et adaptées depuis [KeelHQ](https://github.com/keel-hq/keel/blob/9f0a7160bbdc3a107ad148933a4269f30e4e479c/deployment/deployment-template.yaml))

```yaml
# secret-dashboard.yaml
apiVersion: v1
kind: Secret
metadata:
    name: keel-dashboard-secrets
    namespace: keel
type: Opaque
stringData:
    username: <username>
    password: <password>
```

```yaml {157-160,162-165} collapse={1-155, 166-194}
# keel.yaml
---
apiVersion: v1
kind: Namespace
metadata:
    name: keel

---
apiVersion: v1
kind: ServiceAccount
metadata:
    name: keel
    namespace: keel
    labels:
        app: keel

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
    name: keel
rules:
    - apiGroups:
          - ""
      resources:
          - namespaces
      verbs:
          - watch
          - list
    - apiGroups:
          - ""
      resources:
          - secrets
      verbs:
          - get
          - watch
          - list
    - apiGroups:
          - ""
          - extensions
          - apps
          - batch
      resources:
          - pods
          - replicasets
          - replicationcontrollers
          - statefulsets
          - deployments
          - daemonsets
          - jobs
          - cronjobs
      verbs:
          - get
          - delete # required to delete pods during force upgrade of the same tag
          - watch
          - list
          - update
    - apiGroups:
          - ""
      resources:
          - configmaps
          - pods/portforward
      verbs:
          - get
          - create
          - update

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
    name: keel
roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: keel
subjects:
    - kind: ServiceAccount
      name: keel
      namespace: keel

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: keel
    namespace: keel
spec:
    rules:
        - host: keel.trueberryless.org
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: keel
                            port:
                                number: 9300

    tls:
        - hosts:
              - keel.trueberryless.org
          secretName: keel

---
apiVersion: v1
kind: Service
metadata:
    name: keel
    namespace: keel
    labels:
        app: keel
spec:
    type: LoadBalancer
    ports:
        - port: 9300
          targetPort: 9300
          protocol: TCP
          name: keel
    selector:
        app: keel
    sessionAffinity: None

---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: keel
    namespace: keel
    labels:
        app: keel
spec:
    replicas: 1
    selector:
        matchLabels:
            app: keel
    template:
        metadata:
            labels:
                app: keel
        spec:
            serviceAccountName: keel
            containers:
                - name: keel
                  # Note that we use appVersion to get images tag.
                  image: "keelhq/keel:latest"
                  imagePullPolicy: Always
                  command: ["/bin/keel"]
                  env:
                      - name: NAMESPACE
                        valueFrom:
                            fieldRef:
                                fieldPath: metadata.namespace
                      # Basic auth (to enable UI/API)
                      - name: BASIC_AUTH_USER
                        valueFrom:
                            secretKeyRef:
                                name: keel-dashboard-secrets
                                key: username
                      - name: BASIC_AUTH_PASSWORD
                        valueFrom:
                            secretKeyRef:
                                name: keel-dashboard-secrets
                                key: password
                  ports:
                      - containerPort: 9300
                  livenessProbe:
                      httpGet:
                          path: /healthz
                          port: 9300
                      initialDelaySeconds: 30
                      timeoutSeconds: 10
                  resources:
                      limits:
                          cpu: 100m
                          memory: 128Mi
                      requests:
                          cpu: 50m
                          memory: 64Mi

---
# Source: keel/templates/pod-disruption-budget.yaml

apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
    name: keel
    namespace: keel
spec:
    maxUnavailable: 1
    selector:
        matchLabels:
            app: keel
```

Après avoir appliqué les deux fichiers et géré le certificat supplémentaire pour `keel.trueberryless.org`, le tableau de bord Keel fonctionne parfaitement. De plus, chaque `Deployment` Kubernetes peut opter pour un sondage automatisé de Docker Hub en définissant quelques annotations :

```yaml {8-12} collapse={15-63}
apiVersion: apps/v1
kind: Deployment
metadata:
    name: mutanuq
    namespace: mutanuq
    labels:
        app: mutanuq
    annotations:
        keel.sh/policy: all
        keel.sh/trigger: poll
        keel.sh/pollSchedule: "@every 1m"
        keel.sh/releaseNotes: "https://github.com/trueberryless-org/mutanuq/releases"
spec:
    replicas: 1
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
                  image: trueberryless/mutanuq
                  imagePullPolicy: Always
---
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
---
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

## Fêtez avec un café !

Félicitations, vous avez réussi à configurer [Kubernetes](https://github.com/kubernetes) avec [Cilium](https://github.com/cilium) et [Cloudflare](https://github.com/cloudflare) ! Vous méritez une pause café. Profitez d'une tasse bien méritée, et si vous souhaitez partager un café virtuel avec moi, n'hésitez pas à soutenir mon travail sur [Ko-fi](https://ko-fi.com/trueberryless). Merci !

## Dépannage

### Cilium-ingress n'a pas d'External-IP

Assurez-vous que le `ip-pool` inclut l'adresse spécifiée par les annotations dans le fichier `config.yaml`.

```yaml
# ip-pool.yaml
apiVersion: "cilium.io/v2alpha1"
kind: CiliumLoadBalancerIPPool
metadata:
    name: "first-pool"
spec:
    blocks:
        - start: "192.168.0.240" # 240 included for ingress
          stop: "192.168.0.249"
```

```yaml
#cilium-config.yaml
ingressController:
    enabled: true
    default: true
    loadbalancerMode: shared
    service:
        annotations:
            io.cilium/lb-ipam-ips: 192.168.0.240 # this must be within range
```

:::note
Dans certains cas, d'autres contrôleurs d'ingress obtiennent l'adresse annotée avant que le Cilium IC ne puisse y accéder, donc elle pourrait rester en attente...
:::

Si vous ne déployez pas localement mais sur l'un des `Big Three`, veuillez consulter une autre documentation pour savoir pourquoi l'IP externe est toujours en attente. C'est principalement leur responsabilité de vous fournir une adresse.

### Absence d'approbation du certificat Cloudflare

Il peut y avoir un problème lorsque le certificat n'est pas approuvé par Cloudflare.

#### Jeton API incorrect

Assurez-vous d'abord que le jeton API de Cloudflare est correct. Pour être sûr à 100 %, créez-en un nouveau et placez-le (non encodé en base64) dans ce fichier :

```yaml
apiVersion: v1
kind: Secret
metadata:
    name: cloudflare-api-key-secret
    namespace: cert-manager
type: Opaque
stringData:
    api-key: <Cloudflare API Token (not encrypted)>
```

#### Nombre maximum d'échecs d'authentification atteint

Nous avons rencontré une fois l'erreur `Error: 9109: Max auth failures reached, please check your Authorization header.`. Attendez simplement quelques heures, supprimez la ressource et appliquez-la à nouveau :

```bash
kubectl delete -f certificate.yaml
kubectl apply -f certificate.yaml
```

Avec un peu de chance, tout est bon maintenant !
