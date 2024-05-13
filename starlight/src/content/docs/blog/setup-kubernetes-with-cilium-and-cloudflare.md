---
title: Setting up Kubernetes with Cilium and Cloudflare
date: 2024-05-13
tags:
    - Deployment
    - Kubernetes
    - Cloudflare
excerpt: This blog posts describes the process of setting up a kubernetes cluster with k3s and cilium. We use Helm as the package manager and Cloudflare as the certificate issuer. We used the tips and tricks from Vegard S. Hagen from [this article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/). Essentially, this blog explains, how all the trueberryless.org websites are deployed.
authors:
    - trueberryless
---

## What is Kubernetes?

Working with Docker Containers can be hard. However, there are tools which enhance the management of containers, like Kubernetes. Actually, Kubernetes is the only tool to my knowledge which acts as a management software for Docker Containers. Kubernetes is well-integrated in almost all cloud providers, like Google Cloud, Azure and AWS. As a result, it has a standardized `yaml`-syntax, which is great for small developers because they can switch between `The Big Three` with low effort.

## Install and configure k3s

```bash
curl -sfL https://get.k3s.io | sh -s - \
  --flannel-backend=none \
  --disable-kube-proxy \
  --disable servicelb \
  --disable-network-policy \
  --disable traefik \
  --cluster-init
```

```bash
kubectl get pods -A
```

## Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## Install Cilium

```bash
helm repo add cilium https://helm.cilium.io/
helm repo update
```

## Setup Keel

I always wanted a clean Continuous Integration (CI) and Continuous Delivery (CD) solution for my websites. This means, that I only want to push a commit to GitHub and the website automatically updates itself.

Keel is a robust software tool which enables this feature for Kubernetes. I used Keel for pulling new Docker Images from Docker Hub by polling every few minutes. Moreover, Keel provides a beautiful dashboard where you can control the polling as well.

In order to set up Keel with the admin dashboard, I created these files:

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

```yaml
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

After applying both files and managing the additional certificate for `keel.trueberryless.org`, the CI/CD worked perfectly.
