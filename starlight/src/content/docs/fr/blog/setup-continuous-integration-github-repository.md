---
title: Configurer le déploiement continu dans un repository GitHub
description: Aujourd'hui, nous allons voir comment configurer un repository
  GitHub qui sera déployé sur un cluster k3s via Argo CD.
date: 2024-07-28
tags:
  - Automation
  - Deployment
  - GitHub
excerpt: Aujourd'hui, nous allons voir comment configurer un <a class="gh-badge"
  href="https://github.com/github"><img src="https://github.com/github.png"
  alt="github" />GitHub</a> repository qui sera déployé sur un cluster k3s via
  Argo CD. En résumé, l'article inclura des fichiers Workflow, un Dockerfile,
  des manifestes (déploiement) et des repositories <a class="gh-badge"
  href="https://github.com/docker"><img src="https://github.com/docker.png"
  alt="Docker Hub" />Docker Hub</a>. Veuillez consulter [notre blog sur Argo
  CD](./setup-argocd-for-kubernetes) car ce billet sera une continuation de
  l'autre article.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Github CD"
  image: ../../../../../public/blog/setup-continuous-integration-github-repository.png

---

Dans le billet d'aujourd'hui, nous allons voir rapidement comment configurer un déploiement continu dans un repository [GitHub](https://github.com/github). Nous sommes presque certains que cette configuration fonctionne également pour d'autres registres Git, mais si vous utilisez un autre, gardez à l'esprit que cet article est conçu uniquement pour GitHub.

Cet article suppose également que vous utilisez [GitHub](https://github.com/github) Actions combinées avec Argo CD pour déployer vos applications sur un cluster Kubernetes. Consultez nos [autres articles sur les déploiements](../../blog/tags/deployment/) pour obtenir des instructions supplémentaires sur la façon de configurer ces deux technologies sur votre serveur personnel.

## Préparatifs

Nous vous recommandons de créer un compte [Docker Hub](https://hub.docker.com/) ou de choisir un autre registre Docker si vous le souhaitez.

Votre repository GitHub doit remplir ces conditions :

* Contient un Dockerfile (idéalement dans le dossier racine)
* Contient deux Secrets GitHub ([créer un Secret GitHub](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)) :
  * DOCKER\\\_USERNAME : Votre nom d'utilisateur Docker
  * DOCKER\_PASSWORD : Votre mot de passe Docker (ou [jeton d'accès](https://docs.docker.com/security/for-developers/access-tokens/))

## Créer des fichiers workflow

Les GitHub Actions sont des tâches spéciales dans GitHub qui s'exécutent principalement sur des serveurs Linux et peuvent être contrôlées en créant des fichiers `yaml` dans le répertoire `.github/workflows`. Ces fichiers spéciaux permettent de définir après quels événements ces tâches doivent s'exécuter et offrent beaucoup de flexibilité. En tant qu'utilisateur régulier des Actions GitHub, je peux vous dire que vous devrez souvent réécrire vos fichiers `yaml`, car vous oubliez souvent certains petits détails. Mais sans plus attendre, passons directement à la création d'un fichier `deployment.yaml` adapté, qui effectuera quelques tâches pour nous :

* Pousser une nouvelle image docker sur Docker Hub (avec la version la plus récente).
* Mettre à jour le fichier `manifest/deployment.yaml` pour qu'Argo CD soit notifié de la nouvelle image marquée.
* (optionnel) Créer une nouvelle release sur GitHub, afin que les dates des releases soient documentées là où elles devraient l'être.

```yaml {20}
# deployment.yaml
name: Deployment

on:
    push:
        branches: [main]
    merge_group:
    pull_request:
        branches: [main]
    # Allows you to run this workflow manually from the Actions tab
    workflow_dispatch:

# Automatically cancel in-progress actions on the same branch
concurrency:
    group: ${{ github.workflow }}-${{ github.event_name == 'pull_request_target' && github.head_ref || github.ref }}
    cancel-in-progress: true

env:
    REGISTRY: docker.io
    IMAGE_NAME: trueberryless/blog
    NODE_VERSION: 20

jobs:
    deployment:
        if: contains(github.event.head_commit.message, 'deploy') || github.event_name == 'workflow_dispatch'
        runs-on: ubuntu-latest
        permissions:
            contents: write
        steps:
            - name: Check out the repo
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Create tag
              run: echo "IMAGE_TAG=$(echo $GITHUB_REF_NAME-$GITHUB_SHA)" >> $GITHUB_ENV

            - name: Set up Docker Buildx
              uses: docker/setup-buildx-action@v2

            - name: Log in to Docker Hub
              uses: docker/login-action@v2
              with:
                  username: ${{ secrets.DOCKER_USERNAME }}
                  password: ${{ secrets.DOCKER_PASSWORD }}

            - name: Extract metadata (tags, labels) for Docker
              id: meta
              uses: docker/metadata-action@v4
              with:
                  images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

            - name: Build and push Docker image
              uses: docker/build-push-action@v5
              with:
                  context: .
                  push: true
                  tags: |
                      ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
                      ${{ env.IMAGE_NAME }}:latest
                  labels: ${{ steps.meta.outputs.labels }}

            - name: Update deployment.yaml file
              run: |
                  yq eval '.spec.template.spec.containers[0].image = "${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}"' -i manifest/deployment.yaml

            - uses: stefanzweifel/git-auto-commit-action@v4
              with:
                  commit_message: update deployment.json container image (automated)

            - uses: ncipollo/release-action@v1
              with:
                  tag: ${{ env.IMAGE_TAG }}
                  makeLatest: true
                  body: "A docker image has been deployed to [Docker Hub](https://hub.docker.com/r/${{ env.IMAGE_NAME }}/tags)."
```

Voici un fichier `docker-hub.yaml`, désormais obsolète, que nous utilisions auparavant parce qu'il intègre des stratégies de versionnement intéressantes :

```yaml collapse={1-145}
# docker-hub.yaml
name: Docker Image Push

on:
    push:
        branches: [main]
    merge_group:
    pull_request:
        branches: [main]
    # Allows you to run this workflow manually from the Actions tab
    workflow_dispatch:

# Automatically cancel in-progress actions on the same branch
concurrency:
    group: ${{ github.workflow }}-${{ github.event_name == 'pull_request_target' && github.head_ref || github.ref }}
    cancel-in-progress: true

env:
    REGISTRY: docker.io
    IMAGE_NAME: trueberryless/blog
    NODE_VERSION: 18

jobs:
    docker-push-image:
        if: contains(github.event.head_commit.message, 'version') || github.event_name == 'workflow_dispatch'
        runs-on: ubuntu-latest
        permissions:
            contents: write
        steps:
            - name: Check out the repo
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Check if file exists
              run: |
                  if [ -f .github/artifacts/version.json ]; then
                    echo "File exists"
                    echo "FILE_EXISTS=true" >> $GITHUB_ENV
                  else
                    echo "File does not exist"
                    echo "FILE_EXISTS=false" >> $GITHUB_ENV
                  fi

            - name: read_json
              if: ${{ env.FILE_EXISTS == 'true' }}
              id: version
              uses: zoexx/github-action-json-file-properties@release
              with:
                  file_path: ".github/artifacts/version.json"

            - name: save environment variables
              if: ${{ env.FILE_EXISTS == 'true' }}
              run: |
                  echo "MAJOR=${{steps.version.outputs.major}}" >> $GITHUB_ENV
                  echo "MINOR=${{steps.version.outputs.minor}}" >> $GITHUB_ENV
                  echo "PATCH=${{steps.version.outputs.patch}}" >> $GITHUB_ENV

            - name: create environment variables
              if: ${{ env.FILE_EXISTS == 'false' }}
              run: |
                  echo "MAJOR=0" >> $GITHUB_ENV
                  echo "MINOR=0" >> $GITHUB_ENV
                  echo "PATCH=0" >> $GITHUB_ENV

            - name: echo environment variables
              run: |
                  echo ${{ env.MINOR }}
                  echo ${{ env.MINOR }}
                  echo ${{ env.MINOR }}

            - name: Major version
              if: contains(github.event.head_commit.message, 'major')
              run: |
                  echo "New major version"
                  echo "MAJOR=$((${{ env.MAJOR }}+1))" >> $GITHUB_ENV
                  echo "MINOR=0" >> $GITHUB_ENV
                  echo "PATCH=0" >> $GITHUB_ENV

            - name: Minor version
              if: contains(github.event.head_commit.message, 'minor')
              run: |
                  echo "New minor version"
                  echo "MINOR=$((${{ env.MINOR }}+1))" >> $GITHUB_ENV
                  echo "PATCH=0" >> $GITHUB_ENV

            - name: Patch version
              if: contains(github.event.head_commit.message, 'patch') || github.event_name == 'workflow_dispatch'
              run: |
                  echo "New patch version"
                  echo "PATCH=$((${{ env.PATCH }}+1))" >> $GITHUB_ENV

            - name: Set up Docker Buildx
              uses: docker/setup-buildx-action@v2

            - name: Log in to Docker Hub
              uses: docker/login-action@v2
              with:
                  username: ${{ secrets.DOCKER_USERNAME }}
                  password: ${{ secrets.DOCKER_PASSWORD }}

            - name: Extract metadata (tags, labels) for Docker
              id: meta
              uses: docker/metadata-action@v4
              with:
                  images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

            - name: Build and push Docker image
              uses: docker/build-push-action@v5
              with:
                  context: .
                  push: true
                  tags: |
                      ${{ env.IMAGE_NAME }}:${{ env.MAJOR }}.${{ env.MINOR }}.${{ env.PATCH }}
                      ${{ env.IMAGE_NAME }}:latest
                  labels: ${{ steps.meta.outputs.labels }}

            - name: Check out the repo
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Create folder if necessary
              if: ${{ env.FILE_EXISTS == 'false' }}
              run: mkdir -p .github/artifacts

            - name: write_json
              id: create-json
              uses: jsdaniell/create-json@v1.2.2
              with:
                  name: "version.json"
                  json: '{ "major": ${{ env.MAJOR }}, "minor": ${{ env.MINOR }}, "patch": ${{ env.PATCH }} }'
                  dir: ".github/artifacts/"

            - uses: stefanzweifel/git-auto-commit-action@v4
              with:
                  commit_message: update version.json (automated)

            - name: Update deployment.yaml file
              run: |
                  yq eval '.spec.template.spec.containers[0].image = "${{ env.IMAGE_NAME }}:${{ env.MAJOR }}.${{ env.MINOR }}.${{ env.PATCH }}"' -i manifest/deployment.yaml

            - uses: stefanzweifel/git-auto-commit-action@v4
              with:
                  commit_message: update deployment.json container image (automated)
```

Après avoir copié le contenu de notre fichier `deployment.yaml` et créé le nouveau fichier dans le dossier `.github/workflows`, vous devez procéder à quelques ajustements très **importants** :

* Modifiez le `IMAGE_NAME` pour qu'il corresponde à votre dépôt personnel sur Docker Hub. Le nom de l'image se compose de votre nom de compte et du nom du dépôt. Si vous n'êtes pas sûr de ce qu'est le nom de votre image, vous pouvez consulter l'URL de votre dépôt Docker Hub, il devrait y être mentionné quelque part.

Vous êtes maintenant prêt à ajouter le mot-clé `deploy` dans n'importe quel message de commit de la branche principale de votre dépôt, et cela devrait automatiquement envoyer une image Docker vers Docker Hub et mettre à jour le manifeste pour Argo CD.

## Fêtez avec un café !

Félicitations, vous avez configuré avec succès Argo CD avec k3s et [Cilium](https://github.com/cilium) ! Vous méritez une pause café. Savourez une tasse bien méritée, et si vous souhaitez partager un café virtuel avec moi, n'hésitez pas à soutenir mon travail sur [Ko-fi](https://ko-fi.com/trueberryless). Merci !
