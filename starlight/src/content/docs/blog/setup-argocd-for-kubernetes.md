---
title: Setting up Argo CD in a k3s cluster
date: 2024-07-30
tags:
    - ArgoCD
    - Deployment
    - Kubernetes
excerpt: Continuing to improve our k3s cluster and especially the CI/CD workflow, we now take a look at the GitOps tool called Argo CD, and how we can integrate it into our cluster. Our tech stack for deployment uses these services&#58; k3s, Helm, Cilium & after this tutorial Argo CD as well
authors:
    - trueberryless
---

Having read Vegard S. Hagen's article “[Argo CD Kustomize with Helm](https://blog.stonegarden.dev/articles/2023/09/argocd-kustomize-with-helm/)” and decided that their solution was not the way to go for our cluster, we jumped straight into the default Argo CD “[Getting started](https://argo-cd.readthedocs.io/en/stable/getting_started/)” guide. And now we will walk you through the pain of setting up Argo CD on k3s and cilium, continuing from the chapter “[Setup Certificate Manager with Cloudflare](./setup-kubernetes-with-cilium-and-cloudflare#setup-certificate-manager-with-cloudflare)” of our most recent post “[Setting up Kubernetes with Cilium and Cloudflare](./setup-kubernetes-with-cilium-and-cloudflare)”. In this exact recent post we also set up [Keel](https://keel.sh/) at the end, but this step will now be unnecessary because we'll use Argo CD for getting the newest state-of-the-art code from each GitHub repo. Enjoy reading!

:::note
We assume that you followed our other blog post.
:::

## Requirements

Before we can start, we need to make sure we have `kubectl` installed, a kubeconfig file (k3s saves this file here:

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

) and CoreDNS (check if you have CoreDNS by running this

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

command).

## Installation

First, let's apply all the necessary services, deployments and many other different kubernetes resources by running:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Additionally, we'll need a certificate:

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

and the ingress controller, which we use on every (sub)domain:

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

After applying both and waiting a little bit (request of certificate has to be approved by Cloudflare), we should see the UI under [`https://argo-cd.trueberryless.org`](https://argo-cd.trueberryless.org).
