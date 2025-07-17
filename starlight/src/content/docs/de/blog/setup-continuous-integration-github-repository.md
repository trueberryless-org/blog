---
title: Einrichten von Continuous Deployment in einem GitHub-Repository
description: Heute schauen wir uns an, wie man ein GitHub-Repository einrichtet,
  das über Argo CD in einem k3s-Cluster bereitgestellt wird.
date: 2024-07-28
tags:
  - Automation
  - Deployment
  - GitHub
excerpt: Heute schauen wir uns an, wie man ein <a class="gh-badge"
  href="https://github.com/github"><img src="https://github.com/github.png"
  alt="github" />GitHub</a>-Repository einrichtet, das über Argo CD in einem
  k3s-Cluster bereitgestellt wird. Zusammenfassend wird der Artikel
  Workflow-Dateien, Dockerfile, Manifeste (Deployment) und <a class="gh-badge"
  href="https://github.com/docker"><img src="https://github.com/docker.png"
  alt="Docker Hub" />Docker Hub</a>-Repositories umfassen. Bitte schauen Sie
  sich auch unseren [Argo CD Blog](./setup-argocd-for-kubernetes) an, da dies
  eine Fortsetzung des anderen Beitrags ist.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Github CD"
  image: ../../../../../public/blog/setup-continuous-integration-github-repository.png

---

In diesem Beitrag werfen wir einen kurzen Blick darauf, wie man Continuous Deployment in einem [GitHub](https://github.com/github)-Repository einrichtet. Wir sind uns ziemlich sicher, dass diese Einrichtung auch für andere Git-Registries funktioniert. Falls Sie jedoch eine andere verwenden, beachten Sie, dass dieser Beitrag speziell für GitHub konzipiert ist.

Dieser Beitrag geht außerdem davon aus, dass Sie [GitHub](https://github.com/github) Actions in Kombination mit Argo CD zur Bereitstellung Ihrer Anwendungen auf einem Kubernetes-Cluster verwenden. Weitere Anleitungen zur Einrichtung beider Technologien auf Ihrem persönlichen Server finden Sie in unseren anderen [Deployment-Beiträgen](../../blog/tags/deployment/).

## Vorbereitungen

Wir empfehlen, ein [Docker Hub](https://hub.docker.com/)-Konto zu erstellen oder, falls bevorzugt, ein anderes Docker-Registry zu verwenden.

Ihr GitHub-Repository muss folgende Bedingungen erfüllen:

* An einem Dockerfile vorhanden (idealerweise im Root-Ordner)
* Zwei GitHub Secrets besitzen ([GitHub Secret erstellen](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)):
  * DOCKER\\\_USERNAME: Ihr Docker-Benutzername
  * DOCKER\_PASSWORD: Ihr Docker-Passwort (oder [Access Token](https://docs.docker.com/security/for-developers/access-tokens/))

## Workflow-Datei(en) erstellen

GitHub Actions sind spezielle Jobs in GitHub, die meist auf Linux-Servern laufen und durch das Erstellen von `yaml`-Dateien im Verzeichnis `.github/workflows` gesteuert werden können. Diese speziellen Dateien legen fest, nach welchen Ereignissen die Jobs ausgeführt werden sollen, und bieten viel Freiheit. Als regelmäßiger GitHub-Action-Nutzer kann ich Ihnen sagen: Sie werden oft Ihre `yaml`-Dateien umschreiben, da viele Details oft übersehen werden. Aber ohne Umschweife: Schauen wir uns an, wie man eine passende `deployment.yaml`-Datei erstellt, die folgende Aufgaben für uns übernimmt:

* Ein neues Docker-Image in Docker Hub hochladen (mit der neuesten Version).
* Die Datei `manifest/deployment.yaml` aktualisieren, sodass Argo CD über das neue getaggte Image informiert wird.
* (optional) Einen neuen Release auf GitHub erstellen, damit die Release-Zeiten dokumentiert sind, wo sie hingehören.

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

Hier sehen Sie eine veraltete `docker-hub.yaml`, die wir früher verwendet haben, da sie über praktische Versionierungsstrategien verfügt:

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

Nachdem Sie den Inhalt unserer `deployment.yaml`-Datei kopiert und die neue Datei im Ordner `.github/workflows` erstellt haben, müssen Sie einige sehr **wichtige Anpassungen** vornehmen:

* Ändere den `IMAGE_NAME` zu deinem persönlichen Docker Hub-Repository. Der Image-Name besteht aus deinem Konto-Namen und dem Repository-Namen. Wenn du dir nicht sicher bist, wie dein Image-Name lautet, kannst du die URL des Docker Hub-Repositories ansehen; dort sollte er irgendwo zu finden sein.

Jetzt kannst du das Schlüsselwort `deploy` in jede Commit-Nachricht des Main-Branches deines Repositories hinzufügen, und es sollte automatisch ein Docker-Image zu Docker Hub pushen und das Manifest für Argo CD aktualisieren.

## Mit einem Kaffee feiern!

Herzlichen Glückwunsch, du hast erfolgreich Argo CD mit k3s und [Cilium](https://github.com/cilium) eingerichtet! Du hast dir eine Kaffeepause verdient. Genieße eine wohlverdiente Tasse, und wenn du mir einen virtuellen Kaffee spendieren möchtest, kannst du gerne meine Arbeit auf [Ko-fi](https://ko-fi.com/trueberryless) unterstützen. Vielen Dank!
