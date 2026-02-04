
# Deployment auf Google Cloud Run (Region Zürich / Schweiz)

Diese Anleitung beschreibt, wie du die App in der Google Cloud Region `europe-west6` (Zürich) hostest, um volle Datenhaltung in der Schweiz zu garantieren.

## Voraussetzungen

1.  Ein Google Cloud Platform (GCP) Account.
2.  Installierte [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) auf deinem Computer (MacBook/PC).
3.  Ein aktives Projekt in der Google Cloud Console.

## Schritt 0: Projekt lokal vorbereiten

Ja, du musst den Code zuerst auf deinem Computer haben.

1.  **Download:** Lade diesen Code herunter (Button "Download" oder via Git).
2.  **Entpacken:** Falls es eine ZIP-Datei ist, entpacke sie.
3.  **Terminal öffnen:** Starte das Terminal auf deinem MacBook.
4.  **In Ordner wechseln:** Navigiere mit `cd` in den Ordner:
    ```bash
    cd Downloads/swissbroker-os  # Beispielpfad anpassen
    ```

## Schritt 1: Login & Projektwahl

Führe nun im Terminal folgende Befehle aus:

```bash
# Login bei Google Cloud (öffnet ein Browserfenster)
gcloud auth login

# Projekt setzen (Ersetze DEIN_PROJEKT_ID mit deiner ID aus der Google Cloud Console)
gcloud config set project DEIN_PROJEKT_ID
```

## Schritt 2: Artifact Registry erstellen

Wir brauchen einen Ort, um das Docker-Image zu speichern. Wir wählen Zürich (`europe-west6`).

```bash
gcloud artifacts repositories create swissbroker-repo \
    --repository-format=docker \
    --location=europe-west6 \
    --description="SwissBroker OS Repository"
```

## Schritt 3: Build & Push des Images

Wir bauen den Container lokal bzw. in der Cloud Build Umgebung und laden ihn hoch.
**Wichtig:** Hier wird dein API Key fest in die App integriert.

```bash
# Ersetze DEIN_API_KEY mit deinem echten Google Gemini Key
gcloud builds submit --tag europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/app:latest --build-arg API_KEY=DEIN_API_KEY .
```

*(Hinweis: `DEIN_PROJEKT_ID` muss durch deine echte ID ersetzt werden)*

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
