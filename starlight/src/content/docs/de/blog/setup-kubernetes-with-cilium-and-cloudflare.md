---
title: Einrichtung von Kubernetes mit Cilium und Cloudflare
description: Heute werfen wir einen Blick darauf, wie ein Kubernetes-Cluster mit
  K3s und Cilium eingerichtet wird.
date: 2024-06-11
lastUpdated: 2024-10-01
tags:
  - Deployment
excerpt: Dieser Blogbeitrag beschreibt den Prozess der Einrichtung eines <a
  class="gh-badge" href="https://github.com/kubernetes"><img
  src="https://github.com/kubernetes.png" alt="Kubernetes"
  />Kubernetes</a>-Clusters mit <a class="gh-badge"
  href="https://github.com/k3s-io"><img src="https://github.com/k3s-io.png"
  alt="k3s" />k3s</a> und <a class="gh-badge"
  href="https://github.com/cilium"><img src="https://github.com/cilium.png"
  alt="Cilium" />Cilium</a>. Wir verwenden <a class="gh-badge"
  href="https://github.com/helm"><img src="https://github.com/helm.png"
  alt="Helm" />Helm</a> als Paketmanager und <a class="gh-badge"
  href="https://github.com/cloudflare"><img
  src="https://github.com/cloudflare.png" alt="Cloudflare" />Cloudflare</a> als
  Zertifikatsanbieter. Wir haben die Tipps und Tricks von Vegard S. Hagen aus
  [seinem
  Artikel](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/)
  genutzt. Im Wesentlichen erklärt dieser Blog, wie alle
  trueberryless.org-Websites bereitgestellt werden (nicht mehr aktuell).
authors:
  - trueberryless
  - clemens
cover:
  alt: A beautiful cover image with the text "Kubernetes"
  image: ../../../../../public/blog/setup-kubernetes-with-cilium-and-cloudflare.png
metrics:
  readingTime: 360
  words: 1099

---

Die Arbeit mit [Docker](https://github.com/docker)-Containern kann schwierig sein. Es gibt jedoch Tools, die das Management von Containern verbessern, wie z.B. [Kubernetes](https://github.com/kubernetes). Tatsächlich ist Kubernetes das einzige mir bekannte Tool, das als Verwaltungssoftware für Docker-Container fungiert. Kubernetes ist in fast allen Cloud-Anbietern, wie Google Cloud, Azure und AWS, gut integriert. Dadurch bietet es eine standardisierte `yaml`-Syntax, die für kleine Entwickler großartig ist, da sie mit geringem Aufwand zwischen den `Big Three` wechseln können.

## tl;dr

Installieren Sie alles und wenden Sie dann den Cert-Manager an. Einfach.

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

## Installiere k3s

Wie Hagen in [seinem Artikel](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/) erklärt, wollen wir `k3s` ohne Konfigurationen und mit deaktivierten Komponenten installieren. Er beschreibt im Detail, welche Komponenten nicht installiert werden.

```bash
curl -sfL https://get.k3s.io | sh -s - \
  --flannel-backend=none \
  --disable-kube-proxy \
  --disable servicelb \
  --disable-network-policy \
  --disable traefik \
  --cluster-init
```

Nach der Installation sollten einige Pods laufen (3). Erschrecken Sie nicht, wenn sich die Pods im Zustand `ContainerCreating` oder `Pending` befinden. Dies liegt daran, dass die Pods nicht miteinander kommunizieren können, da wir das CNI (`--flannel-backend=none`) deaktiviert haben. Später werden wir [Cilium](https://github.com/cilium) installieren, das das Flannel-CNI ersetzen wird.

```bash
kubectl get pods -A
```

## Installiere Helm

Helm ist der Paketmanager für [Kubernetes](https://github.com/kubernetes), daher sollten Sie es entweder direkt installieren (folgen Sie den [Helm-Dokumentationen](https://helm.sh/docs/intro/install/)) oder Teile von Helm verwenden, die mit Cilium geliefert werden. Wir haben uns entschieden, Helm direkt zu installieren, was mit diesem Befehl problemlos möglich ist:

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## Installiere Cilium

[Cilium](https://github.com/cilium) ist eine Netzwerk- und Sicherheitssoftware für Kubernetes. Cilium ist sehr schnell, skalierbar und sicher, da es auf eBPF basiert — eine revolutionäre Technologie, die sandboxed Programme im Linux-Kernel ausführen kann, ohne den Kernel neu zu kompilieren oder Kernel-Module zu laden.

Wir könnten Cilium mit Helm wie hier gezeigt installieren:

```bash
helm repo add cilium https://helm.cilium.io/
helm repo update
helm install cilium cilium/cilium
```

Wir wollten jedoch die Installation mit ihrem CLI durchführen, und so geht es. Installieren Sie zunächst das Cilium-CLI, indem Sie diesen Code-Schnipsel ausführen:

```bash
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz
```

Dann können Sie Cilium mit Ihrer Server-IP-Adresse installieren:

```bash
cilium install \
  --set k8sServiceHost=${API_SERVER_IP} \
  --set k8sServicePort=6443 \
  --set kubeProxyReplacement=true
```

Jetzt warten wir, bis Cilium meldet, dass alles `OK` oder `disabled` ist:

```bash
cilium status --wait
```

Nach einer Weile sollten alle Pods den Status `Running` haben.

```bash
kubectl get pods -A
```

Zu guter Letzt können Sie einige Ressourcen für Cilium anwenden:

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

Außerdem sollten Sie die Cilium-Konfiguration aktualisieren. Um dies mit den richtigen Werten zu tun, erstellen Sie zunächst diese Datei im Root-Verzeichnis, in dem Sie den k3s-Cluster verwalten möchten. Später könnten Sie auch einige hubble- und prometheus-bezogene Eigenschaften anwenden, wenn Sie [Grafana](https://github.com/Grafana) oder ähnliches verwenden wollen (öffnen Sie die ausgeblendeten Zeilen, wenn Sie unsere Konfiguration ebenfalls verwenden möchten).

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

Führen Sie diesen Befehl aus, um ein Upgrade durchzuführen:

```bash
cilium upgrade -f cilium-config.yaml
```

## Richte den Zertifikatsmanager mit Cloudflare ein

Um Zertifikate für jede Subdomain erstellen zu können, ist es wichtig, einen Zertifikatsanbieter anzuwenden, der Zertifikatsanfragen bearbeitet und diese bei einem Anbieter auflöst. Wir haben [Cloudflare](https://github.com/cloudflare) als unseren Anbieter gewählt, und hier ist die Konfiguration, die Sie auf Ihren Kubernetes-Cluster anwenden müssen. Weitere Informationen finden Sie in den [Dokumentationen zum Cert-Manager](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/).

Aber zuerst müssen wir den cert-manager installieren, indem wir den folgenden Befehl ausführen:

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

Sie können eine Datei auf den [Kubernetes](https://github.com/kubernetes)-Cluster anwenden, indem Sie diesen k8s- (oder k3s-)Befehl ausführen:

```bash
kubectl apply -f cluster-issuer.yaml
```

Wenn Sie die Ressource im Kubernetes-Cluster löschen möchten, ist der Befehl ziemlich einfach:

```bash
kubectl delete -f cluster-issuer.yaml
```

Wie Sie oben vielleicht bemerkt haben, benötigen wir auch ein Geheimnis für das API-Token, das authentifiziert, dass dieser Aussteller berechtigt ist, Zertifikate anzufordern. Daher erstellen wir ein Geheimnis mit einem unverschlüsselten `API Token` von Cloudflare.

Heutzutage erstellen wir ein Token, indem wir zum [Cloudflare](https://github.com/cloudflare)-Dashboard gehen, dann auf Ihr Profil klicken und die Registerkarte `API Tokens` auswählen. Hier können Sie ein spezifisches Token für Ihren Aussteller generieren oder den globalen API-Schlüssel verwenden (nicht mehr empfohlen). Die empfohlene Lösung ist, ein API-Token mit zwei Berechtigungen (benutzerdefiniertes Token) zu erstellen:

* Zone - DNS - Bearbeiten
* Zone - Zone - Lesen

![Cloudflare-API-Token](../../../../../assets/cloudflare/cloudflare_api_token.png)

Eine detailliertere Beschreibung der Tokens finden Sie in den [Cloudflare-Dokumenten](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

Nach der Anwendung dieses Geheimnisses auf Kubernetes sollte der Aussteller bereit sein, ein paar unerwünschte Anfragen zu lösen!

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

Sie können diesen Aussteller nun verwenden, indem Sie diese Datei anwenden, die hoffentlich ein Zertifikat erstellt:

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

In der Regel dauert es etwa 90 Sekunden, bis der Antrag nach der Anwendung authentifiziert ist. Sie können den aktuellen Status der Anfrage überprüfen, indem Sie diesen Kubernetes-Befehl ausführen. Falls es länger als 2 Minuten dauert, können möglicherweise einige Tipps unter [#Fehlerbehebung](#no-cloudflare-certificate-approval) helfen.

```bash
kubectl describe certificaterequests.cert-manager.io -n mutanuq
```

:::tip
Die Option `-n` steht für Namespace.
:::

## Beispiel-Anwendung [`mutanuq`](https://mutanuq.trueberryless.org)

Dann können Sie dieses Zertifikat in Ihrem Ingress-Controller verwenden:

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

## Keel einrichten

Wir wollten schon immer eine saubere Continuous Integration (CI)- und Continuous Delivery (CD)-Lösung für unsere Websites. Das bedeutet, dass eine bestimmte Commit-Nachricht einen automatisierten Prozess über [GitHub](https://github.com/github), Docker Hub und unseren Server auslösen sollte, der am Ende die entsprechende Website nach etwa zwei Minuten aktualisiert.

Keel ist ein robustes Software-Tool, das diese Funktion für Kubernetes ermöglicht. Wir haben Keel verwendet, um neue Docker-Images von Docker Hub abzufragen und diese alle paar Minuten zu aktualisieren. Außerdem bietet Keel ein schönes Dashboard, mit dem Sie die Abfragen steuern können.

Um Keel mit dem Admin-Dashboard einzurichten, haben wir diese Dateien erstellt:

* `secret-dashboard.yaml` für den Admin-Benutzernamen und das Passwort (nicht jeder sollte Zugriff auf das Dashboard haben)
* `keel.yaml` für die eigentlichen k3s-Konfigurationen (kopiert und angepasst von [KeelHQ](https://github.com/keel-hq/keel/blob/9f0a7160bbdc3a107ad148933a4269f30e4e479c/deployment/deployment-template.yaml))

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

Nach der Anwendung beider Dateien und der Verwaltung des zusätzlichen Zertifikats für `keel.trueberryless.org` funktioniert das Keel-Dashboard perfekt. Außerdem kann jede Kubernetes `Deployment`-Ressource durch Setzen einiger Annotationen für automatisiertes Docker-Hub-Polling aktiviert werden:

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

## Mit einem Kaffee feiern!

Herzlichen Glückwunsch, Sie haben erfolgreich [Kubernetes](https://github.com/kubernetes) mit [Cilium](https://github.com/cilium) und [Cloudflare](https://github.com/cloudflare) eingerichtet! Sie haben sich eine Kaffeepause verdient. Genießen Sie eine wohlverdiente Tasse, und wenn Sie gerne einen virtuellen Kaffee mit mir teilen möchten, unterstützen Sie mich gerne auf [Ko-fi](https://ko-fi.com/trueberryless). Vielen Dank!

## Fehlerbehebung

### Cilium-Ingress hat keine External-IP

Stellen Sie sicher, dass der `ip-pool` die Adresse enthält, die in den Anmerkungen der Datei `config.yaml` angegeben ist.

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
In einigen Fällen erhalten andere Ingress-Controller die annotierte Adresse, bevor der Cilium-IC darauf zugreifen kann, sodass sie weiterhin im Wartezustand bleibt...
:::

Wenn Sie nicht lokal, sondern auf einer der "Großen Drei" bereitstellen, prüfen Sie bitte andere Dokumentationen, warum die External-IP noch aussteht. Es ist hauptsächlich deren Verpflichtung, Ihnen eine Adresse bereitzustellen.

### Keine Cloudflare-Zertifikatsgenehmigung

Es kann ein Problem auftreten, wenn das Zertifikat von Cloudflare nicht genehmigt wird.

#### Falscher API-Token

Stellen Sie zunächst sicher, dass der Cloudflare-API-Token korrekt ist. Um 100-prozentige Sicherheit zu haben, erstellen Sie einen neuen und legen Sie ihn (nicht Base64-kodiert) in dieser Datei ab:

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

#### Maximale Authentifizierungsfehler erreicht

Wir sind einmal auf den Fehler `Error: 9109: Max auth failures reached, please check your Authorization header.` gestoßen. Warten Sie einfach ein paar Stunden, löschen Sie die Ressource und wenden Sie sie erneut an:

```bash
kubectl delete -f certificate.yaml
kubectl apply -f certificate.yaml
```

Hoffentlich ist jetzt alles in Ordnung!
