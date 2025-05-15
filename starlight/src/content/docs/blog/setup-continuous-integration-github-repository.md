---
title: Setting up Continuous deployment in a GitHub repository
descrption: Today we'll take a look at how to set up a GitHub repository which will be deployed to a k3s cluster via Argo CD.
date: 2024-07-28
tags:
    - CI/CD
    - Deployment
    - ArgoCD
    - GitHub
excerpt: Today we'll take a look at how to set up a GitHub repository which will be deployed to a k3s cluster via Argo CD. In summary, the article will include Workflow files, Dockerfile, manifests (deployment) and Docker Hub repositories. Please check out [our Argo CD blog](./setup-argocd-for-kubernetes) because this will be a continuation of the other post.
authors:
    - trueberryless
cover:
  alt: A beautiful cover image with the text "Github CD"
  image: ../../../assets/covers/githubcd.png
---

In today's post, we'll take a quick look at how to set up continuous deployment in a GitHub repository. We're pretty sure that this setup also works for other Git registries, but if you use another, keep in mind that this post is designed for GitHub only.

This post also assumes that you use GitHub Actions combined with Argo CD for deploying your applications on a Kubernetes cluster. Follow other [deployment posts](/blog/tags/deployment) of us for further instructions on how to set up both technologies on your personal server.

## Preparations

We recommend creating a [Docker Hub](https://hub.docker.com/) account or choose another Docker registry if you want.

Your GitHub repository must fulfil these conditions:

-   Has a Dockerfile (ideally in the root folder)
-   Has two GitHub Secrets ([create GitHub Secret](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)):
    -   DOCKER_USERNAME: Your docker username
    -   DOCKER_PASSWORD: Your docker password (or [access token](https://docs.docker.com/security/for-developers/access-tokens/))

## Create workflow file(s)

GitHub Actions are special jobs in GitHub which mostly run on Linux servers and can be controlled by creating `yaml` files in the directory `.github/workflows`. These special files can controll after which events these jobs should run and they give you a lot of freedom. As a regular GitHub Action user I can tell you, get used to rewriting your `yaml` files pretty often because you often forget to think about the small details. But without further ado, let's jump straight into creating a fitting `deployment.yaml` file, which will do some jobs for us:

-   Push a new docker image to Docker Hub (with the newest version).
-   Update the `manifest/deployment.yaml` file, so Argo CD gets notified about the new tagged image.
-   (optional) Create a new release on GitHub, so the times of releases are documented where they should be.

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

Here you have an obsolete `docker-hub.yaml` which we used to use because it has nice versioning strategies:

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

After copying the contents of our `deployment.yaml` file and creating the new file in the `.github/workflows` folder, you need to do a bit of very **important adapting**:

-   Change the `IMAGE_NAME` to your personal Docker Hub repository. The image name consists of your account name and the repository name. If your not sure what your image name is, you can take a look at the URL of the Docker Hub repository, it should be in there somewhere.

Now you should be good to go to add the keyword `deploy` into any commit message to the main branch of your repository and it should automatically push a docker image to Docker Hub and update the manifest for Argo CD.

## Celebrate with a Coffee!

Congratulations, you've successfully set up Argo CD with k3s and Cilium! You deserve a coffee break. Enjoy a well-earned cup, and if you'd like to share a virtual coffee with me, feel free to support my work on [Ko-fi](https://ko-fi.com/trueberryless). Thank you!
