---
title: Setting up Kubernetes with Cilium and Cloudflare
date: 2024-05-08
tags:
    - Deployment
    - Kubernetes
    - Cloudflare
excerpt: This blog posts describes the process of setting up a kubernetes cluster with k3s and cilium. We use Helm as the package manager and Cloudflare as the certificate issuer. We used the tips and tricks from Vegard S. Hagen from [this article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/). Essentially, this blog explains, how all the trueberryless.org websites are deployed.
authors:
    - trueberryless
---

## What is Kubernetes?

Working with Docker Containers can be hard. However, there are tools which enhance the management of containers, like Kubernetes. Actually, Kubernetes is the only tool to my knowledge which acts as a management software for Docker Containers. Kubernetes is well-integreted in almost all cloud providers, like Google Cloud, Azure and AWS. As a result, it has a standardized `yaml`-syntax, which is great for small developers because they can switch between `The Big Three` with low effort.

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
