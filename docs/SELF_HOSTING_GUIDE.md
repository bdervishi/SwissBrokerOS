
# SwissBroker OS: Self-Hosting Guide (Supabase)

Diese Anleitung beschreibt, wie du **Supabase** (die Datenbank und das Backend) auf einem eigenen Server (z.B. in der Schweiz bei Infomaniak) installierst und **SwissBroker OS** damit verbindest.

Dies ist die empfohlene Methode, um **Datenschutz (nDSG)** und **Kosteneffizienz** zu kombinieren.

---

## 1. Voraussetzungen

*   **Ein Linux Server (VPS):**
    *   Empfohlen: Ubuntu 20.04 oder 22.04.
    *   Hardware: Min. 2 CPU, 4GB RAM (für stabile Performance).
    *   Anbieter: Infomaniak (Schweiz), Exoscale (Schweiz) oder Hetzner (Günstig, Server in DE).
*   **Eine Domain (Optional aber empfohlen):** z.B. `db.deine-firma.ch` für das Backend.
*   **Zugriff:** SSH-Zugriff auf den Server.

---

## 2. Server Vorbereitung (Docker Installation)

Verbinde dich via SSH mit deinem Server und führe folgende Befehle aus, um Docker zu installieren:

```bash
# 1. System updaten
sudo apt-get update
sudo apt-get upgrade -y

# 2. Notwendige Pakete installieren
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Docker GPG Key hinzufügen
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Repository hinzufügen
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Docker Engine installieren
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

---

## 3. Supabase Installieren

Wir nutzen das offizielle Docker-Setup von Supabase.

```bash
# 1. Supabase Repository klonen
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# 2. Konfiguration kopieren
cp .env.example .env

# 3. Konfiguration anpassen (WICHTIG!)
nano .env
```

**Ändere in der `.env` Datei unbedingt folgende Werte:**

*   `POSTGRES_PASSWORD`: Ein sehr sicheres Passwort generieren!
*   `JWT_SECRET`: Ein langes, zufälliges Secret (nutze z.B. `openssl rand -base64 32`).
*   `SITE_URL`: Die URL, unter der dein Dashboard erreichbar sein soll (z.B. `http://DEINE-SERVER-IP:3000`).
*   `API_EXTERNAL_URL`: `http://DEINE-SERVER-IP:8000`

**Starten:**

```bash
docker compose up -d
```

Nach ca. 1-2 Minuten laufen alle Container.
Du erreichst das **Supabase Studio (Dashboard)** nun unter: `http://DEINE-SERVER-IP:8000`.

---

## 4. Datenbank Einrichten (Schema)

Logge dich im Supabase Studio ein (Default User/PW steht oft in der Doku, meistens aber kein Login im Self-Hosted Mode nötig oder du konfigurierst es).

Gehe zum **SQL Editor** und führe folgendes Skript aus, um die Tabellen für SwissBroker OS zu erstellen:

```sql
-- 1. Klienten Tabelle
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    address TEXT,
    zip_city TEXT,
    advisor_id TEXT, -- Verknüpfung zum Broker User (aus Mock oder Auth)
    tenant_id TEXT,  -- Mandantenfähigkeit
    role TEXT DEFAULT 'CLIENT'
);

-- 2. Policen Tabelle
CREATE TABLE public.policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    insurer TEXT NOT NULL,
    type TEXT NOT NULL, -- z.B. 'Privathaftpflicht'
    policy_number TEXT,
    premium_amount NUMERIC,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'ACTIVE' -- ACTIVE, PENDING, CANCELLED
);

-- 3. Row Level Security (RLS) aktivieren (Optional für Sicherheit)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder darf lesen (für Dev-Modus, später einschränken!)
CREATE POLICY "Allow all access" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.policies FOR ALL USING (true);
```

---

## 5. SwissBroker OS verbinden

Gehe zurück zu deinem lokalen Code-Projekt (dieses Repository).

1.  Öffne die Datei `.env` im Hauptverzeichnis.
2.  Setze `VITE_USE_MOCK_DATA` auf `false`.
3.  Trage die Daten deines Servers ein.

```env
# .env Datei

# Die URL deines VPS + Port 8000
VITE_SUPABASE_URL=http://123.456.78.90:8000

# Den 'anon' key findest du in deinem Server unter:
# supabase/docker/volumes/api/kong.yml (oder er wurde beim Start im Log ausgegeben)
# Alternativ im Supabase Studio unter Settings -> API
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Schaltet die Mock-Daten aus und die echte DB an
VITE_USE_MOCK_DATA=false
```

---

## 6. Testen

1.  Starte deine App neu: `npm run dev`.
2.  Öffne das **Dashboard** oder die **Klienten-Liste**.
3.  Du solltest nun eine leere Liste sehen (da die DB frisch ist).
4.  Wenn du Fehler in der Konsole siehst (`Network Error`), prüfe ob:
    *   Port 8000 auf deinem Server in der Firewall (ufw / Security Group) offen ist.
    *   Der `VITE_SUPABASE_ANON_KEY` korrekt ist.

## 7. Produktions-Checkliste (Wichtig für nDSG)

Bevor du echte Kundendaten speicherst:

1.  **SSL/HTTPS:** Nutze einen Reverse Proxy (wie Nginx oder Caddy) auf dem Server, um Port 8000 mit einem SSL-Zertifikat (Let's Encrypt) abzusichern. Verbinde dich nie über `http://` mit echten Daten.
2.  **Backups:** Richte einen Cronjob auf dem Server ein, der täglich `docker compose exec db pg_dump ...` ausführt und das Backup an einen sicheren Ort (z.B. S3 Bucket oder lokales NAS) schiebt.
3.  **Firewall:** Schließe alle Ports ausser 80/443 (und SSH) nach aussen.

