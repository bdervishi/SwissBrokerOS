
# Deployment auf Google Cloud Run (Region Zürich / Schweiz)

Diese Anleitung beschreibt, wie du die App in der Google Cloud Region `europe-west6` (Zürich) hostest, um volle Datenhaltung in der Schweiz zu garantieren.

## Voraussetzungen

1.  Ein Google Cloud Platform (GCP) Account.
2.  Installierte [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) auf deinem Computer (MacBook/PC).
3.  Ein aktives Projekt in der Google Cloud Console.
4.  **WICHTIG:** Ein aktives **Rechnungskonto (Billing Account)** muss mit dem Projekt verknüpft sein. Google Cloud Run und Artifact Registry erfordern dies, auch wenn du im kostenlosen Rahmen bleibst.

## Schritt 0: Projekt lokal vorbereiten

Ja, du musst den Code zuerst auf deinem Computer haben.

1.  **Download:** Lade diesen Code herunter (Button "Download" oder via Git).
2.  **Entpacken:** Falls es eine ZIP-Datei ist, entpacke sie.
3.  **Terminal öffnen:** Starte das Terminal auf deinem MacBook.
4.  **In Ordner wechseln:** Navigiere mit `cd` in den Ordner:
    ```bash
    cd Downloads/swissbroker-os  # Beispielpfad anpassen
    ```

### Wichtige Datei: Dockerfile
Stelle sicher, dass eine Datei namens `Dockerfile` (ohne Dateiendung) im Hauptverzeichnis existiert. Sie sollte folgenden Inhalt haben:

```dockerfile
# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm ci

# Source Code kopieren
COPY . .

# API Key als Build Argument annehmen (wird von Vite eingebacken)
ARG API_KEY
ENV API_KEY=$API_KEY

# Build ausführen
RUN npm run build

# Stage 2: Serve (Nginx)
FROM nginx:alpine

# Build-Ergebnisse kopieren
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx Config kopieren (für React Router Support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Schritt 1: Login & Projektwahl

Führe nun im Terminal folgende Befehle aus:

```bash
# Login bei Google Cloud (öffnet ein Browserfenster)
gcloud auth login

# Projekt setzen (Ersetze DEIN_PROJEKT_ID mit deiner ID aus der Google Cloud Console)
gcloud config set project DEIN_PROJEKT_ID
```

*(Hinweis: Eine Warnung zu fehlenden "environment tags" kannst du ignorieren, solange "Updated property [core/project]" erscheint.)*

## Schritt 2: Artifact Registry erstellen

Wir brauchen einen Ort, um das Docker-Image zu speichern. Wir wählen Zürich (`europe-west6`).

```bash
gcloud artifacts repositories create swissbroker-repo \
    --repository-format=docker \
    --location=europe-west6 \
    --description="SwissBroker OS Repository"
```

## Schritt 3: Build & Push des Images

Wir nutzen `cloudbuild.yaml`, um den API Key sicher zu übergeben.

**Kopiere diesen Befehl (angepasst für dein Projekt):**

```bash
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_API_KEY=DEIN_ECHTER_API_KEY,_IMAGE_NAME=europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/app:latest \
    .
```

*(Ersetze `DEIN_ECHTER_API_KEY` und `DEIN_PROJEKT_ID` entsprechend)*

## Schritt 4: Deployment auf Cloud Run (Zürich)

Jetzt starten wir den Server in Zürich.

```bash
gcloud run deploy swissbroker-os \
    --image europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/app:latest \
    --platform managed \
    --region europe-west6 \
    --allow-unauthenticated \
    --port 80
```

### Parameter Erklärung:
*   `--region europe-west6`: **Zwingend**, damit der Server physisch in Zürich steht.
*   `--allow-unauthenticated`: Macht die Webseite öffentlich erreichbar.

## Schritt 5: Fertig!

Nach dem Deployment erhältst du im Terminal eine URL (z.B. `https://swissbroker-os-uc.a.run.app`).

Deine App läuft nun:
1.  Auf Google Servern.
2.  Physisch in der Schweiz (Zürich).
3.  Mit Autoscaling (skaliert auf 0, wenn niemand sie nutzt = geringe Kosten).

---

## Troubleshooting

### Fehler: "Billing account ... is not found"
Dieser Fehler bedeutet, dass deinem Google Cloud Projekt noch kein Rechnungskonto hinterlegt ist.
Google Cloud Dienste wie "Run" und "Artifact Registry" erfordern eine hinterlegte Zahlungsmethode (Kreditkarte), auch wenn die Nutzung oft durch das kostenlose Guthaben abgedeckt ist.

**Lösung:**
1. Öffne die [Google Cloud Console Billing](https://console.cloud.google.com/billing).
2. Klicke auf "Rechnungskonto verknüpfen" (Link billing account).
3. Wähle dein Projekt aus und füge eine Zahlungsmethode hinzu.
4. Führe den Befehl im Terminal erneut aus.

### Fehler: "Image ... not found"
Das bedeutet, dass Schritt 3 (Build) übersprungen wurde oder fehlgeschlagen ist. Cloud Run kann nichts starten, was nicht vorher gebaut wurde.

**Lösung:**
Führe Schritt 3 (`gcloud builds submit ...`) erneut aus und warte, bis er "SUCCESS" meldet. Erst danach Schritt 4 ausführen.
