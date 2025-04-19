---
title: Setting up Kubernetes with Cilium and Cloudflare
description: This blog posts describes the process of setting up a kubernetes cluster with k3s and cilium. We use Helm as the package manager and Cloudflare as the certificate issuer. We used the tips and tricks from Vegard S. Hagen from [his article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/). Essentially, this blog explains, how all the trueberryless.org websites are deployed.
pubDate: "Jun 11 2024"
heroImage: "https://release-image-generator.trueberryless.org?text=Kubernetes&width=960&height=480"
---

Working with Docker Containers can be hard. However, there are tools which enhance the management of containers, like Kubernetes. Actually, Kubernetes is the only tool to my knowledge which acts as a management software for Docker Containers. Kubernetes is well-integrated in almost all cloud providers, like Google Cloud, Azure and AWS. As a result, it has a standardized `yaml`-syntax, which is great for small developers because they can switch between `The Big Three` with low effort.

## tl;dr

Install everything and then apply cert-manager. ez

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

## Install k3s

As Hagen explains in [his article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/), we want to install `k3s` with no configurations and everything disabled. He describes what components are not installed in details.

```bash
curl -sfL https://get.k3s.io | sh -s - \
  --flannel-backend=none \
  --disable-kube-proxy \
  --disable servicelb \
  --disable-network-policy \
  --disable traefik \
  --cluster-init
```

After the installation, there should be some pods running (3). Don't be shocked if the pods are in the `ContainerCreating` or `Pending` state. This is because the pods can't communicate between each other because we disabled the CNI (`--flannel-backend=none`). We will later install Cilium, which will be the replacement of the Flannel CNI.

```bash
kubectl get pods -A
```

## Install Helm

Helm is the package manager for Kubernetes, so you should either install it directly (follow the [Helm docs](https://helm.sh/docs/intro/install/)) or use parts of Helm which are shipped with Cilium. We chose to install Helm directly, which is easily possible with this command:

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## Install Cilium

Cilium is a networking and security software for Kubernetes. Cilium is very fast, scalable and secure because it's built upon eBPF -- a revolutionary technology that can run sandboxed programs in the Linux kernel without recompiling the kernel or loading kernel modules.

We could install Cilium with Helm like shown here:

```bash
helm repo add cilium https://helm.cilium.io/
helm repo update
helm install cilium cilium/cilium
```

However, we wanted to install with their CLI and this is how you can do it. Firstly, install the Cilium CLI by running this code snipped:

```bash
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz
```

Then you can install Cilium with your Server IP-Address:

```bash
cilium install \
  --set k8sServiceHost=${API_SERVER_IP} \
  --set k8sServicePort=6443 \
  --set kubeProxyReplacement=true
```

Now we wait until Cilium says, everything is `OK` or `disabled`:

```bash
cilium status --wait
```

After a while, all pods should be `Running`.

```bash
kubectl get pods -A
```

Last but not least, you can apply some resources for Cilium:

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

Additionally you should upgrade the cilium config. In order to do that with the proper values, first create this file in the root directory where you wanna manage the k3s cluster. Later you could also apply some hubble and prometheus related properties if you want to use [Grafana](https://grafana.com/) or so (open the collapsed lines if you want to use our config as well).

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

Run this command to upgrade:

```bash
cilium upgrade -f cilium-config.yaml
```

## Setup Certificate Manager with Cloudflare

In order to be able to create certificates for each subdomain, it is important to apply a certificate issuer which handles certificate requests and resolves them at some provider. We chose Cloudflare as our issuer and here is the setup which you need to apply to your kubernetes cluster. For further information you can check out the [cert-manager docs](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/).

But first, we need to install the cert-manager by running the following command:

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

You can apply a file to the Kubernetes cluster, by running this k8s (also k3s) command:

```bash
kubectl apply -f cluster-issuer.yaml
```

If you want to delete the resource in the Kubernetes cluster, the command is pretty straight forward:

```bash
kubectl delete -f cluster-issuer.yaml
```

As you may have spotted above, we also need a secret for the API token which authenticates that this issuer is allowed to request certificates. Therefore, we create a secret with an unencrypted `API Token` from Cloudflare.

Nowadays we create a token by going to your Cloudflare dashboard, then click on your profile and select the tab `API Tokens`. Here you can generate a specific token for your issuer or use the Global API Key (not recommended any more). The recommended solution is to create a API token with two permissions (custom token):

-   Zone - DNS - Edit
-   Zone - Zone - Read

![Cloudflare API Token](../../assets/cloudflare/cloudflare_api_token.png)

A more detailed description about the tokens, can be found in the [Cloudflare docs](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

After applying this secret to Kubernetes, the issuer should be ready to resolve some bad boys!

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

You can now use this issuer by applying this file which will hopefully create a certificate:

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

It usually takes around 90 seconds to authenticate the request once applied. You can check the current status of the request by running this kubernetes command.
If it takes longer than 2 minutes, maybe some tips in [#Troubleshooting](#no-cloudflare-certificate-approval) can help you.

```bash
kubectl describe certificaterequests.cert-manager.io -n mutanuq
```

:::tip
The `-n` option stands for namespace.
:::

## Example app [`mutanuq`](https://mutanuq.trueberryless.org)

Then you can use this certificate in your Ingress controller:

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

## Setup Keel

We always wanted a clean Continuous Integration (CI) and Continuous Delivery (CD) solution for our websites. This means, that a specific commit message should trigger an automated process over GitHub, Docker Hub and our server, which in the end updates the corresponding website after about two minutes.

Keel is a robust software tool which enables this feature for Kubernetes. We used Keel for pulling new Docker Images from Docker Hub by polling every few minutes. Moreover, Keel provides a beautiful dashboard where you can control the polling as well.

In order to set up Keel with the admin dashboard, we created those files:

-   `secret-dashboard.yaml` for the Admin Username and Password (not everyone should be able to access the dashboard)
-   `keel.yaml` for the actual k3s configs (copied and adapted from [KeelHQ](https://github.com/keel-hq/keel/blob/9f0a7160bbdc3a107ad148933a4269f30e4e479c/deployment/deployment-template.yaml))

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

After applying both files and managing the additional certificate for `keel.trueberryless.org`, the Keel dashboard works perfectly. Moreover, every Kubernetes `Deployment` can opt in for automated Docker Hub Polling by setting some annotations:

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

## Celebrate with a Coffee!

Congratulations, you've successfully set up Kubernetes with Cilium and Cloudflare! You deserve a coffee break. Enjoy a well-earned cup, and if you'd like to share a virtual coffee with me, feel free to support my work on [Ko-fi](https://ko-fi.com/trueberryless). Thank you!

## Troubleshooting

### Cilium-ingress has no External-IP

Make sure that the `ip-pool` includes the address specified by the annotations in the `config.yaml` file.

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
Also in some cases, other ingress controllers get the annotated address before the Cilium IC can access it, so it would still be pending...
:::

If you don't deploy locally but on one of `The Big Three`, please check out some other documentation on why the External IP is still pending. It's mostly their obligation to provide you with an address.

### No Cloudflare Certificate Approval

There can be some problem when the certificate won't get approved by Cloudflare.

#### Wrong API token

First make sure that the Cloudflare API token is correct. To make 100 percent sure, create a new one and put it (not base64 encoded) into this file:

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

#### Max auth failures reached

We once ran into the error `Error: 9109: Max auth failures reached, please check your Authorization header.`. Just wait a few hours, delete the resource and apply it again:

```bash
kubectl delete -f certificate.yaml
kubectl apply -f certificate.yaml
```

Hopefully, you're now good to go!
