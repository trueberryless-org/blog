---
title: Einrichten von Argo CD in einem k3s-Cluster
description: Heute werfen wir einen Blick darauf, wie man Argo CD in einem
  k3s-Cluster einrichtet.
date: 2024-07-27
lastUpdated: 2024-07-28
tags:
  - Automation
  - Deployment
excerpt: "Wir verbessern weiterhin unseren k3s-Cluster und insbesondere den
  CI/CD-Workflow. Nun werfen wir einen Blick auf das GitOps-Tool namens Argo CD
  und darauf, wie wir es in unseren Cluster integrieren können. Unser Tech-Stack
  für die Bereitstellung umfasst folgende Dienste: k3s, Helm, Cilium & nach
  diesem Tutorial auch Argo CD."
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Argo CD"
  image: ../../../../../public/blog/setup-argocd-for-kubernetes.png

---

Nachdem wir Vegard S. Hagens Artikel “[Argo CD Kustomize with Helm](https://blog.stonegarden.dev/articles/2023/09/argocd-kustomize-with-helm/)” gelesen und entschieden hatten, dass ihre Lösung nicht der richtige Ansatz für unseren Cluster war, sind wir direkt in die Standard-Argo-CD-Anleitung “[Getting started](https://argo-cd.readthedocs.io/en/stable/getting_started/)” eingetaucht. Jetzt führen wir Sie durch die Herausforderung, [Argo CD](https://github.com/argoproj) auf [k3s](https://github.com/k3s-io) und [Cilium](https://github.com/cilium) einzurichten, als Fortsetzung des Kapitels “[Setup Certificate Manager with Cloudflare](../../blog/setup-kubernetes-with-cilium-and-cloudflare#setup-certificate-manager-with-cloudflare/)” unseres letzten Blogposts “[Setting up Kubernetes with Cilium and Cloudflare](../../blog/setup-kubernetes-with-cilium-and-cloudflare/)”. In diesem letzten Beitrag haben wir außerdem [Keel](https://github.com/keel-hq) eingerichtet, aber dieser Schritt ist jetzt überflüssig, da wir Argo CD verwenden, um den neuesten Stand der Technik aus jedem GitHub-Repository zu beziehen. Viel Spaß beim Lesen!

:::note
Wir gehen davon aus, dass Sie [unserem anderen Blogpost](../../blog/setup-kubernetes-with-cilium-and-cloudflare/) gefolgt sind.
:::

## Anforderungen

Bevor wir anfangen, müssen wir sicherstellen, dass `kubectl` installiert ist, eine kubeconfig-Datei vorhanden ist (k3s speichert diese Datei hier:

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

) und CoreDNS (prüfen Sie, ob Sie CoreDNS haben, indem Sie diesen

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

Befehl ausführen).

## Installation

Zunächst wenden wir alle notwendigen Dienste, Deployments und viele andere verschiedene Kubernetes-Ressourcen an, indem wir Folgendes ausführen:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Zertifikat

Zusätzlich benötigen wir ein Zertifikat:

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

Wenden Sie diese Ressource an, indem Sie `kubectl apply -f certificate.yaml` ausführen.

## Ingress-Controller

Außerdem benötigen wir einen Ingress-Controller, der von Cilium verwaltet wird:

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

Wenden Sie diese Ressource an, indem Sie `kubectl apply -f argocd-ingress.yaml` ausführen.

## Deaktivieren von TSL innerhalb von Argo CD

Mit dem Zertifikat ist die Verbindung zwischen Client und Server gesichert. Innerhalb der [Argo CD](https://github.com/argoproj)-Dienste gibt es jedoch immer noch ein selbst-signiertes Zertifikat, das wir nicht unbedingt benötigen. Wir können daher die Sicherheitsfunktion des Argo-CD-Servers deaktivieren, indem wir die Eigenschaft `server.insecure` bearbeiten.

Um dies zu tun, führen wir zunächst diesen Befehl aus:

```bash
kubectl edit cm argocd-cmd-params-cm -n argocd
```

dies sollte hoffentlich eine Datei in vim oder neovim öffnen (alles andere wäre peinlich, wenn Sie uns fragen, LOL). Die Datei sollte in etwa so aussehen:

```yaml {21-22}
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
data:
    server.insecure: "true"
kind: ConfigMap
metadata:
    annotations:
        kubectl.kubernetes.io/last-applied-configuration: |
            {"apiVersion":"v1","kind":"ConfigMap","metadata":{"annotations":{},"labels":{"app.kubernetes.io/name":"argocd-cmd-params-cm","app.kubernetes.io/part-of":"argocd"},"name":"arg
    creationTimestamp: "2024-07-27T11:15:28Z"
    labels:
        app.kubernetes.io/name: argocd-cmd-params-cm
        app.kubernetes.io/part-of: argocd
    name: argocd-cmd-params-cm
    namespace: argocd
    resourceVersion: "239710156"
    uid: 5f53d26b-3adf-4ed9-9807-c3da847335a2
data:
    server.insecure: "true"
```

Die letzten beiden Zeilen sind wahrscheinlich anfangs nicht vorhanden, aber genau diese Einstellung möchten wir erreichen. Fügen Sie diese beiden Zeilen hinzu (oben markiert) und speichern Sie die Datei (`Esc` → `:wq`, wenn Sie cool sind).

Starten Sie den Argo-CD-Server neu, indem Sie Folgendes ausführen und warten, bis der Rollout abgeschlossen ist:

```bash
kubectl rollout restart deploy argocd-server -n argocd
kubectl rollout status deploy argocd-server -n argocd
```

Nach all diesen Schritten sollten wir die Benutzeroberfläche nun unter [`https://argo-cd.trueberryless.org`](https://argo-cd.trueberryless.org) sehen (passwortgeschützt).

![Argo CD UI Dashboard](../../../../assets/argocd/argocd_ui_dashboard.png)

:::note
Die Anmeldedaten der Argo-CD-UI bestehen aus einem Benutzernamen und einem Passwort. Der Benutzername ist immer `admin` und Ihr Passwort können Sie wie folgt abrufen:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```
:::

## Manifest in Repository hinzufügen

Um eine neue Anwendung in [Argo CD](https://github.com/argoproj) zu erstellen (entweder über die UI oder CLI — wir verwenden die UI, da wir die CLI nicht eingerichtet haben), müssen wir das Git-Repository vorbereiten. Da das Repository die einzige Quelle der Wahrheit ist, definieren wir hier auch alle Kubernetes-Ressourcen, die von Argo CD erstellt werden sollen.

Wir empfehlen, einen neuen Ordner im Git-Repository zu erstellen, der so etwas wie `manifest` genannt wird. In diesem Ordner erstellen wir ein paar Dateien:

* `certificate.yaml`:

  ```yaml
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

* `deployment.yaml`:

  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
      name: mutanuq
      namespace: mutanuq
      labels:
          app: mutanuq
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
                  image: "trueberryless/mutanuq"
                  imagePullPolicy: Always
  ```

* `service.yaml`:

  ```yaml
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
  ```

* `ingress.yaml`:

  ```yaml
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

Diese Dateien sind im Grunde genau dieselben Dateien, die in dem [anderen Artikel](../../blog/setup-kubernetes-with-cilium-and-cloudflare#example-app-mutanuq/) erwähnt werden, jedoch in vier Dateien aufgeteilt, da uns dies den Vorteil verschafft, das Manifest von GitHub Actions aus zu manipulieren. Aber der Reihe nach — Sie werden im [nächsten Artikel](../../blog/setup-continuous-integration-github-repository/) sehen, wie man das Manifest mit GitHub Actions einrichtet.

## Neue Anwendung in Argo CD UI erstellen

Sie werden wahrscheinlich den großen `NEW APP`-Knopf in der UI von [Argo CD](https://github.com/argoproj) sehen. Klicken Sie darauf und erstellen Sie eine neue Anwendung mit den unten angepassten Eigenschaften:

* Anwendungsname: `mutanuq`
* Projektname: `default`
* Synchronisierungsrichtlinie: Mehr dazu in [diesem Artikel](../../blog/setup-continuous-integration-github-repository/) / lassen Sie es für jetzt auf `Manual`
* Repository-URL: `https://github.com/trueberryless-org/mutanuq`
* Revision: `HEAD`
* Pfad: `manifest`
* Cluster-URL: `https://kubernetes.default.svc`
* Namespace: `mutanuq`

Optional — wenn Sie [die CLI installiert haben](https://argo-cd.readthedocs.io/en/stable/cli_installation/) — können Sie diesen Befehl für dasselbe Ergebnis ausführen:

```bash
argocd app create mutanuq \
  --project default \
  --repo https://github.com/trueberryless-org/mutanuq \
  --revision HEAD \
  --path manifest \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace mutanuq
```

Nun sollten Sie hoffentlich Ihre Website in der UI bereitgestellt sehen. Dieser Prozess kann einige Zeit in Anspruch nehmen, da beispielsweise die Zertifikatsanfrage genehmigt werden muss. Eine gesunde Anwendung sollte in etwa so aussehen:

![Argo CD Example Application UI](../../../../assets/argocd/argocd_example_application_ui.png)

## Feiern Sie mit einem Kaffee!

Herzlichen Glückwunsch, Sie haben erfolgreich [Argo CD](https://github.com/argoproj) auf einem [k3s](https://github.com/k3s-io)-Cluster eingerichtet! Sie haben sich eine Kaffeepause verdient. Genießen Sie eine wohlverdiente Tasse, und wenn Sie mir einen virtuellen Kaffee spendieren möchten, unterstützen Sie meine Arbeit gerne auf [Ko-fi](https://ko-fi.com/trueberryless). Vielen Dank!

## Weiterführung

Fortsetzung in unserem [nächsten Blog](../../blog/setup-continuous-integration-github-repository/), in dem beschrieben wird, wie man ein GitHub-Repository einrichtet, das anschließend über Argo CD bereitgestellt werden kann.
