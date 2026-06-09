# E-Mail-Versand über Mailjet (Custom SMTP für Supabase Auth)

Alle Auth-Mails (Magic-Link-Login, Passwort-Reset, Signup-Bestätigung) verschickt
**Supabase** selbst. Der eingebaute Supabase-Mailversand ist hart limitiert
(~2 Mails/Stunde) und nur für Tests gedacht. Mit **Mailjet als Custom SMTP**
(EU-Server, Gratis-Tarif 6'000 Mails/Monat, 200/Tag) fällt dieses Limit weg.

> Es ist **kein Code-Change** nötig – die App sendet keine eigenen Mails.
> Alles passiert in den Mailjet- und Supabase-Dashboards.

---

## 1. Mailjet-Konto anlegen
1. Auf <https://www.mailjet.com> registrieren (Gratis-Tarif, keine Kreditkarte nötig).
2. Region/Land ausfüllen. Mailjet hostet in der **EU (Frankreich)** → DSGVO/revDSG-konform.

## 2. Absender-Domain authentifizieren (wichtig für Zustellbarkeit)
Mailjet → **Senders & Domains** → *Add a Sender Domain or Address*.

**Empfohlen: ganze Domain authentifizieren** (statt nur einer Einzeladresse),
damit du z. B. `no-reply@trifti.ch` nutzen kannst:

1. Domain eingeben, z. B. `trifti.ch`.
2. Mailjet zeigt dir zwei DNS-Einträge. Diese beim Domain-Anbieter (wo `trifti.ch`
   verwaltet wird) hinzufügen:

   | Typ | Name/Host | Wert |
   |---|---|---|
   | **TXT (SPF)** | `trifti.ch` | `v=spf1 include:spf.mailjet.com ?all` |
   | **TXT (DKIM)** | `mailjet._domainkey.trifti.ch` | *(langer von Mailjet generierter Schlüssel)* |

   > Hast du bereits einen SPF-Eintrag, NICHT einen zweiten anlegen, sondern
   > `include:spf.mailjet.com` in den bestehenden einfügen.
   > Optional (empfohlen) DMARC: TXT auf `_dmarc.trifti.ch` →
   > `v=DMARC1; p=none; rua=mailto:dmarc@trifti.ch`

3. In Mailjet auf **Check now** klicken. DNS-Propagation kann 15 Min – 24 h dauern.
   Beide Häkchen (SPF + DKIM) müssen grün sein.

> Schneller Test ohne eigene Domain: stattdessen nur eine **Einzeladresse**
> verifizieren (Mailjet schickt eine Bestätigungsmail). Zustellbarkeit ist dann
> schlechter (kein DKIM) – für Produktion die Domain authentifizieren.

## 3. SMTP-Zugangsdaten holen
Mailjet → **Account Settings → REST API → API Key Management (Primary)**.
Dort stehen zwei Schlüssel:

| Feld in Supabase | Mailjet-Wert |
|---|---|
| SMTP **Username** | **API Key** (der öffentliche „API Key") |
| SMTP **Password** | **Secret Key** (der private „Secret Key") |

> Diese SMTP-Zugangsdaten sind serverseitige Secrets – nie ins Repo committen.

## 4. Custom SMTP in Supabase eintragen
Supabase Dashboard → **Authentication → Emails → SMTP Settings** →
*Enable Custom SMTP* aktivieren und ausfüllen:

| Feld | Wert |
|---|---|
| **Sender email** | `no-reply@trifti.ch` *(muss auf der in Schritt 2 verifizierten Domain liegen!)* |
| **Sender name** | `SwissBroker OS` |
| **Host** | `in-v3.mailjet.com` |
| **Port** | `587` *(STARTTLS; Alternativen: 465 SSL, 2525)* |
| **Username** | *Mailjet API Key* |
| **Password** | *Mailjet Secret Key* |

Speichern.

## 5. Rate-Limit anheben
Supabase → **Authentication → Rate Limits** → *Rate limit for sending emails*.
Standard ist sehr niedrig. Auf z. B. **30 pro Stunde** setzen.

> Mailjet-Gratis erlaubt **200 Mails/Tag** → bleib darunter
> (30/h × ~7 h = sicher). Reicht für Login/Reset/Signup locker.

## 6. Testen
1. App-Login öffnen → Magic-Link anfordern.
2. Mail sollte **sofort** kommen, Absender `no-reply@trifti.ch`.
3. Kontrolle in Mailjet → **Statistics / Messages**: jede gesendete Mail wird
   dort mit Status (sent/opened/bounced) protokolliert.

## Fehlersuche
| Symptom | Ursache / Fix |
|---|---|
| Keine Mail, in Mailjet ein **„550 / sender not allowed"** | Sender-Adresse/Domain in Mailjet noch nicht verifiziert (Schritt 2) |
| Mail landet im **Spam** | DKIM noch nicht grün, oder DMARC fehlt → Domain-Auth abschließen |
| Supabase-Fehler **„Error sending confirmation email"** | Falscher Username/Password – es müssen **API Key / Secret Key** sein, nicht E-Mail/Passwort des Mailjet-Logins |
| Weiterhin „rate limit exceeded" | Custom SMTP nicht aktiviert (Häkchen) oder Rate-Limit aus Schritt 5 nicht erhöht |
| `otp_expired` trotz frischem Link | E-Mail-Scanner (z. B. Outlook Safe Links) öffnet den Einmal-Link vorab → bei Gmail unproblematisch; sonst auf 6-stelligen Code (`{{ .Token }}`) umstellen |

## (Optional) E-Mail-Vorlagen anpassen
Supabase → **Authentication → Emails → Templates**. Hier Betreff/Text der
Magic-Link-/Reset-/Confirm-Mails branden. Der Login-Link steckt in
`{{ .ConfirmationURL }}`.
