---
title: Einrichten von Continuous Deployment in einem GitHub-Repository
description: Heute werfen wir einen Blick darauf, wie man ein GitHub-Repository
  einrichtet, das über Argo CD in einem k3s-Cluster bereitgestellt wird.
date: 2024-07-28
tags:
  - Automation
  - Deployment
  - GitHub
excerpt: Heute werfen wir einen Blick darauf, wie man ein GitHub-Repository
  einrichtet, das über Argo CD in einem k3s-Cluster bereitgestellt wird.
  Zusammengefasst wird der Artikel Workflow-Dateien, Dockerfile, Manifeste
  (Deployment) und Docker Hub-Repositories beinhalten. Bitte sehen Sie sich
  [unseren Argo CD-Blog](./setup-argocd-for-kubernetes) an, da dies eine
  Fortsetzung des vorherigen Beitrags sein wird.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Github CD"
  image: ../../../../../public/blog/setup-continuous-integration-github-repository.png

---

In diesem Artikel werfen wir einen kurzen Blick darauf, wie man Continuous Deployment in einem GitHub-Repository einrichtet. Wir sind uns ziemlich sicher, dass diese Einrichtung auch für andere Git-Registries funktioniert, aber wenn Sie eine andere verwenden, beachten Sie bitte, dass dieser Beitrag speziell für GitHub gedacht ist.

Dieser Beitrag setzt voraus, dass Sie GitHub Actions zusammen mit Argo CD verwenden, um Ihre Anwendungen in einem Kubernetes-Cluster bereitzustellen. Folgen Sie unseren anderen [Deployment-Beiträgen](../../blog/tags/deployment/) für weitere Anleitungen, wie Sie beide Technologien auf Ihrem persönlichen Server einrichten können.

## Vorbereitungen

Wir empfehlen, ein [Docker Hub](https://hub.docker.com/) Konto zu erstellen oder eine andere Docker-Registry zu wählen, wenn Sie möchten.

Ihr GitHub-Repository muss folgende Bedingungen erfüllen:

* Hat ein Dockerfile (idealerweise im Root-Verzeichnis)
* Hat zwei GitHub Secrets ([GitHub Secret erstellen](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)):
  * DOCKER\_USERNAME: Ihr Docker-Benutzername
  * DOCKER\_PASSWORD: Ihr Docker-Passwort (oder [Access-Token](https://docs.docker.com/security/for-developers/access-tokens/))

## Workflow-Datei(en) erstellen

GitHub Actions sind spezielle Jobs in GitHub, die meist auf Linux-Servern laufen und durch das Erstellen von `yaml`-Dateien im Verzeichnis `.github/workflows` gesteuert werden können. Diese speziellen Dateien legen fest, nach welchen Ereignissen diese Jobs ausgeführt werden sollen, und bieten Ihnen eine große Freiheit. Als regelmäßiger GitHub-Action-Nutzer kann ich Ihnen sagen: Gewöhnen Sie sich daran, Ihre `yaml`-Dateien ziemlich oft umzuschreiben, da Sie oft vergessen, an die kleinen Details zu denken. Aber ohne weitere Umschweife lassen Sie uns direkt mit der Erstellung einer passenden `deployment.yaml`-Datei beginnen, die einige Jobs für uns erledigt:

* Eine neue Docker-Image-Version auf Docker Hub hochladen (mit der neuesten Version).
* Die Datei `manifest/deployment.yaml` aktualisieren, damit Argo CD über das neue Tagged-Image informiert wird.
* (Optional) Eine neue Veröffentlichung auf GitHub erstellen, damit die Zeitpunkte der Veröffentlichungen dokumentiert werden, wo sie sollten.

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

Hier ist eine veraltete `docker-hub.yaml`, die wir früher verwendet haben, da sie schöne Versionierungsstrategien bietet:

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

Nach dem Kopieren des Inhalts unserer `deployment.yaml`-Datei und dem Erstellen der neuen Datei im Ordner `.github/workflows` müssen Sie einige sehr **wichtige Anpassungen** vornehmen:

* Ändern Sie den `IMAGE_NAME` zu Ihrem persönlichen Docker Hub-Repository. Der Image-Name besteht aus Ihrem Kontonamen und dem Repository-Namen. Wenn Sie sich nicht sicher sind, was Ihr Image-Name ist, können Sie sich die URL des Docker Hub-Repositories ansehen, dort sollte er irgendwo zu finden sein.

Nun sollten Sie bereit sein, das Stichwort `deploy` in eine beliebige Commit-Nachricht des Hauptzweiges Ihres Repositories einzufügen, und es sollte automatisch ein Docker-Image zu Docker Hub hochladen und das Manifest für Argo CD aktualisieren.

## Feiern Sie mit einem Kaffee!

Herzlichen Glückwunsch, Sie haben Argo CD erfolgreich mit k3s und [Cilium](https://github.com/cilium) eingerichtet! Sie verdienen eine Kaffeepause. Genießen Sie eine wohlverdiente Tasse, und wenn Sie mir virtuell einen Kaffee spendieren möchten, unterstützen Sie gerne meine Arbeit auf [Ko-fi](https://ko-fi.com/trueberryless). Vielen Dank!
