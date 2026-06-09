
# Deployment Anleitung (Vercel)

Diese Anwendung ist für das Hosting auf **Vercel** optimiert.

## Schritt 1: GitHub Repository erstellen
1. Erstelle ein neues Repository auf GitHub.
2. Lade diesen Code in das Repository hoch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SwissBroker OS"
   git branch -M main
   git remote add origin <DEINE_GITHUB_REPO_URL>
   git push -u origin main
   ```

## Schritt 2: Vercel Projekt verbinden
1. Gehe auf [vercel.com](https://vercel.com) und erstelle einen Account.
2. Klicke auf "Add New..." -> "Project".
3. Importiere dein Git-Repository.

## Schritt 3: Environment Variables setzen
Bevor du auf "Deploy" klickst, musst du die Umgebungsvariablen konfigurieren.

Im Vercel Dashboard unter **"Environment Variables"** füge hinzu:

| Name | Wert | Beschreibung |
|------|------|--------------|
| `API_KEY` | `Dein-Google-Gemini-Key` | Für die KI-Funktionen (z.B. ai.google.dev) |
| `VITE_USE_MOCK_DATA` | `true` | Setze auf `false`, wenn du Supabase nutzt |
| `VITE_SUPABASE_URL` | `...` | Optional: Deine Datenbank URL |
| `VITE_SUPABASE_ANON_KEY` | `...` | Optional: Dein Datenbank Key |

**Wichtig:** Wenn du den Google API Key hier einträgst, wird er im Frontend-Build fest integriert. Für eine reine Demo ist das okay. Für eine echte Produktions-App solltest du den `backend/` Ordner separat auf einem Dienst wie **Render.com** oder **Railway** hosten und `VITE_BACKEND_URL` auf diese URL setzen.

## Schritt 4: Deployment
1. Klicke auf **Deploy**.
2. Vercel baut die Anwendung (`npm run build`).
3. Nach ca. 1 Minute ist deine App unter `https://dein-projekt.vercel.app` erreichbar.

## Fehlerbehebung
*   **404 beim Neuladen:** Wurde durch die `vercel.json` behoben.
*   **KI funktioniert nicht:** Prüfe, ob der `API_KEY` in den Vercel Settings korrekt gesetzt ist und redeploye das Projekt, falls du ihn nachträglich geändert hast.

## Troubleshooting: Vercel "Blocked" / commit author not matched

Vercel's **Hobby** plan only deploys commits whose **author email** belongs to
the GitHub account that owns the Vercel project. If you see
*"commit email … could not be matched to a GitHub account"* or *"Hobby teams do
not support collaboration"*:

1. Add & verify the commit author email on that GitHub account
   (GitHub → Settings → Emails). Attribution is retroactive and immediate.
2. Old "Blocked" deployments are **not** re-evaluated automatically — trigger a
   **new** deployment: merge a PR, click **Redeploy**, or push a fresh commit
   (`git commit --allow-empty -m "chore: redeploy" && git push`).
