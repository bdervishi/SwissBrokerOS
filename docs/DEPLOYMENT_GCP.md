# Deployment auf Google Cloud Run (Full Stack: Frontend + Backend)

Diese Anleitung beschreibt das Deployment der kompletten **SwissBroker OS** Architektur (React Frontend + Node.js Backend) in der Region `europe-west6` (Zürich).

## Architektur-Übersicht

1.  **Frontend (React/Vite):** Läuft im Nginx Container. Liefert die UI aus.
2.  **Backend (Node.js):** Läuft im Node Container. Fungiert als sicherer Proxy zur Google Gemini API (versteckt den API Key).
3.  **Datenbank (Supabase):** Extern gehostet (siehe `SELF_HOSTING_GUIDE.md` oder Supabase Cloud).

---

## Teil A: Vorbereitung

1.  **GCP Setup:**
    *   Installiere `gcloud` CLI.
    *   Login: `gcloud auth login`.
    *   Projekt wählen: `gcloud config set project DEIN_PROJEKT_ID`.
    *   Billing aktivieren (Zwingend für Cloud Run).

2.  **Artifact Registry erstellen (Zürich):**
    ```bash
    gcloud artifacts repositories create swissbroker-repo \
        --repository-format=docker \
        --location=europe-west6 \
        --description="SwissBroker OS Repository"
    ```

---

## Teil B: Backend Deployment (Der AI Proxy)

Das Backend muss **zuerst** deployed werden, da das Frontend die URL des Backends wissen muss.

### 1. Die `backend/Dockerfile`
Stelle sicher, dass im Ordner `backend/` folgende `Dockerfile` liegt:

```dockerfile
# Stage 1: Build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
# Verwende npm install statt ci, um Fehler bei fehlendem Lockfile zu vermeiden
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Installiere nur Production-Dependencies
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 2. Backend Build & Deploy
Wechsle in den Backend Ordner:
```bash
cd backend
```

Führe den Build & Deploy Prozess aus. Wir übergeben den Google Gemini API Key hier als Umgebungsvariable an den Server:

```bash
# 1. Build & Push via Cloud Build
gcloud builds submit --config cloudbuild.yaml \
    --substitutions="_GOOGLE_API_KEY=DEIN_ECHTER_GEMINI_KEY,_IMAGE_NAME=europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/backend:latest" \
    .

# 2. Deploy auf Cloud Run
gcloud run deploy swissbroker-backend \
    --image europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/backend:latest \
    --platform managed \
    --region europe-west6 \
    --allow-unauthenticated \
    --port 3000
```

### 3. Backend URL notieren
Nach dem Deployment erhältst du eine URL (z.B. `https://swissbroker-backend-xyz.a.run.app`).
**Notiere diese URL!** Du brauchst sie gleich für das Frontend.
Der API-Endpunkt für das Frontend ist dann: `https://swissbroker-backend-xyz.a.run.app/api/generate`.

---

## Teil C: Frontend Deployment (React App)

Gehe zurück in das Hauptverzeichnis (`cd ..`).

### 1. Die `Dockerfile` (Root)
Stelle sicher, dass im Hauptverzeichnis die Nginx-Dockerfile liegt (siehe vorherige Docs).

### 2. Frontend Build & Deploy
Hier müssen wir nun die **Backend URL** und die **Supabase Daten** in den Build "einbacken". Vite ersetzt diese Variablen während des Builds (`npm run build`).

Es gibt zwei Möglichkeiten, die Variablen zu setzen:

**Option A: Cloud Build (Variablen fest einbacken)**
Nachteil: Du musst bei jeder Änderung der Variablen neu bauen.

```bash
gcloud builds submit --config cloudbuild.yaml \
    --substitutions="_API_KEY=dummy_value,_IMAGE_NAME=europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/app:latest" \
    .
```
*(Hinweis: `_API_KEY` ist hier ein Dummy, da wir jetzt das Backend nutzen, aber der Build-Prozess erwartet evtl. noch ein Argument. Wichtiger sind die Runtime-Vars unten)*

**Option B: Runtime Variablen in Cloud Run (Empfohlen)**
Wir bauen das Image und setzen die Variablen erst beim Starten des Containers. Dafür muss dein Code `window.env` oder ähnliches unterstützen, ODER wir nutzen Vite's `define` feature beim Build.

Da wir Vite nutzen, ist es am einfachsten, die Variablen in der **Cloud Run Konsole** oder beim Deploy-Befehl zu setzen, *sofern* der Code sie zur Laufzeit liest.
Da Vite Environment Variables standardmäßig zur *Build-Zeit* ersetzt werden, müssen wir das Image mit den korrekten Werten bauen.

Nutze daher Cloud Build mit den korrekten Werten:

```bash
# Ersetze die Platzhalter mit deinen echten Werten!
# BACKEND_URL muss auf /api/generate enden!

gcloud builds submit \
    --tag europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/app:latest \
    --build-arg VITE_BACKEND_URL=https://swissbroker-backend-xyz.a.run.app/api/generate \
    --build-arg VITE_SUPABASE_URL=https://deine-supabase-url.com \
    --build-arg VITE_SUPABASE_ANON_KEY=dein-anon-key \
    --build-arg VITE_USE_MOCK_DATA=false \
    .
```

*(Hinweis: Du musst deine `Dockerfile` im Root evtl. anpassen, um `ARG` Befehle für VITE_... zu akzeptieren, siehe unten)*

### 3. Frontend auf Cloud Run starten

```bash
gcloud run deploy swissbroker-os \
    --image europe-west6-docker.pkg.dev/DEIN_PROJEKT_ID/swissbroker-repo/app:latest \
    --platform managed \
    --region europe-west6 \
    --allow-unauthenticated \
    --port 80
```

---

## Anhang: Dockerfile Update für Frontend (Root)

Damit die Build-Args (`--build-arg`) funktionieren, muss deine `Dockerfile` im Hauptverzeichnis so aussehen:

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build Arguments definieren
ARG VITE_BACKEND_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_USE_MOCK_DATA

# Environment Variablen setzen, damit Vite sie beim Build sieht
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```