---
title: Setting up Argo CD in a k3s cluster
date: 2024-07-30
tags:
    - ArgoCD
    - Deployment
    - Kubernetes
excerpt: Continuing to improve our k3s cluster and especially the CI/CD workflow, we now take a look at the GitOps tool called Argo CD, and how we can integrate it into our cluster.
authors:
    - trueberryless
---

Having read Vegard S. Hagen's article “[Argo CD Kustomize with Helm](https://blog.stonegarden.dev/articles/2023/09/argocd-kustomize-with-helm/)” and decided that their solution was not the way to go for our cluster, we jumped straight into the default Argo CD “[Getting started](https://argo-cd.readthedocs.io/en/stable/getting_started/)” guide. And now we will walk you through the pain of setting up Argo CD on k3s and cilium, continuing from the chapter “[Setup Certificate Manager with Cloudflare](./setup-kubernetes-with-cilium-and-cloudflare#setup-certificate-manager-with-cloudflare)” of our recent post “[Setting up Kubernetes with Cilium and Cloudflare](./setup-kubernetes-with-cilium-and-cloudflare)”. In this exact recent post we also set up [Keel](https://keel.sh/) at the end, but this step will now be unnecessary because we'll use Argo CD for getting the newest state-of-the-art code from each GitHub repo. Enjoy reading!
