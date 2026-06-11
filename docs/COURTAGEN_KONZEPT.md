# Courtage-Konzept — SwissBroker OS

> Status: KONZEPT (zur Freigabe). Noch nichts davon ist gebaut.
> Ziel: Aus dem heutigen Anzeige-Modul ein vollständiges, innovatives
> Courtage-Management machen — vom Soll bis zur Auszahlung.

---

## 1. Ist-Analyse

| Baustein | Heute | Bewertung |
|---|---|---|
| `commissions`-Tabelle | flach: amount, status (PENDING/PAID), type (ACQUISITION/RECURRING), source_partner, agent_id, date | ⚠️ keine Verknüpfung zu Police/Kunde, kein Soll/Ist |
| Commissions-Seite | reine Anzeige (Liste/Statistik), keine Erfassung | ⚠️ read-only |
| Police | `initial_commission`, `liability_duration_months` (Stornohaftung) — im Wizard erfassbar | ✅ Basis vorhanden |
| Automation | Storno-Reminder am Ende der Haftungszeit (Kalendereintrag) | 🟡 nur Erinnerung, keine Verrechnung |
| Splits | `agentSplitPercentage` existiert nur im TS-Typ, nicht in der DB | ❌ |
| Abrechnungsabgleich | nicht vorhanden | ❌ — der grösste Schmerzpunkt jedes Brokers |

## 2. Fachliches Fundament (Schweizer Realität)

1. **Zwei Courtage-Arten:** **Abschlusscourtage** (einmalig, bei Abschluss, mit
   Stornohaftung 1–5 Jahre) und **Bestandescourtage** (wiederkehrend, % der
   Jahresprämie, solange die Police läuft — das "MRR" des Brokers).
2. **Courtagevereinbarungen:** Sätze sind **pro Versicherer und Sparte**
   verhandelt (z. B. AXA Hausrat 15 % Abschluss / 10 % Bestand). Heute leben
   diese Vereinbarungen in Excel/Köpfen.
3. **Courtageabrechnungen:** Versicherer liefern periodisch (monatlich/
   quartalsweise) Abrechnungen als PDF/Excel. Der Broker muss prüfen: *Stimmt
   das mit meinem Bestand überein?* — manuell, fehleranfällig, oft unterlassen
   → entgangene Courtagen ("Leakage").
4. **Stornorisiko:** Kündigt der Kunde in der Haftungszeit, fordert der
   Versicherer die Abschlusscourtage **pro rata zurück** — inkl. Durchgriff auf
   bereits ausbezahlte Mitarbeiter-Splits.
5. **Interne Splits:** Die Firma erhält die Courtage, Berater werden nach
   Regelwerk beteiligt (fix % je Sparte, Stufenmodelle, Übernahme-Bestände).
6. **Regulatorik:** Art. 45b VAG verpflichtet ungebundene Vermittler, dem
   Kunden die **Entschädigung offenzulegen**.

## 3. Zielbild — Datenmodell

```
commission_agreements        ── Courtagevereinbarung je Versicherer/Sparte
  tenant_id, insurer, line (Sparte), acquisition_rate %, recurring_rate %,
  liability_months (Default-Stornohaftung), valid_from/valid_to, notes

commissions (erweitert)      ── eine Zeile pro erwarteter/erhaltener Position
  + policy_id, client_id, agreement_id, period (z. B. 2026-06)
  + expected_amount (Soll)  |  amount = Ist
  + statement_item_id
  + status: EXPECTED → MATCHED → PAID → DISPUTED → CLAWBACK
  + split_agent_id, split_rate, split_amount, split_paid_at

commission_statements        ── hochgeladene Versicherer-Abrechnung
  tenant_id, insurer, period, document_id (→ Dokumenten-Ablage!),
  total_amount, status (NEW/PARSED/RECONCILED), parsed_at

commission_statement_items   ── KI-extrahierte Positionen der Abrechnung
  statement_id, policy_number, client_name, line, premium, amount, raw jsonb

commission_split_rules       ── Regelwerk pro Mitarbeiter
  tenant_id, agent_id, line (optional), rate %, valid_from
```

Alles tenant-isoliert (RLS wie bestehende Tabellen).

## 4. Kernprozesse

### 4.1 Automatische Soll-Stellung (aus der Police)
Beim Speichern einer Police wird gegen die passende Courtagevereinbarung
(Versicherer + Sparte) der **Courtage-Plan generiert**:
- 1× `EXPECTED` Abschlusscourtage (Prämie × acquisition_rate, fällig Periode des Beginns)
- n× `EXPECTED` Bestandescourtagen (jährlich, Prämie × recurring_rate)
- Manuell erfasste `initial_commission` der Police übersteuert den Satz.
→ Der Broker sieht jederzeit: *Was steht mir zu?*

### 4.2 KI-Abrechnungsabgleich ⭐ (Herzstück / Innovation)
1. Courtageabrechnung (PDF/Excel) in die **bestehende Dokumenten-Ablage** hochladen, Kategorie "Courtageabrechnung".
2. Backend-Pipeline (Gemini, bereits im Stack für Call-Agent/Extraktion):
   extrahiert Positionen → `commission_statement_items`.
3. **Auto-Matching** gegen `EXPECTED` (Police-Nr. → Betrag ± Toleranz → Periode):
   - Match → Status `MATCHED`/`PAID`
   - **Fehlend** (erwartet, nicht abgerechnet) → "Leakage"-Liste ⭐
   - **Zu tief** → `DISPUTED` mit Differenzbetrag
   - **Unerwartet** (abgerechnet, keine Police im System) → Hinweis auf Datenlücke
4. Abweichungs-Dashboard mit Ein-Klick-Reklamations-E-Mail an den Versicherer.

### 4.3 Storno-Management mit Verrechnung
Police wird gekündigt → System berechnet **pro-rata-Rückforderung**
(verbleibende Haftungsmonate / Haftungszeit × Abschlusscourtage), bucht
`CLAWBACK` und **verrechnet automatisch den Mitarbeiter-Split** mit der
nächsten Auszahlungsabrechnung.

### 4.4 Splits & Auszahlungsabrechnung
Regelwerk pro Berater (`commission_split_rules`) → bei jedem `PAID` wird der
Split gebucht → monatliche **Auszahlungsabrechnung pro Berater** (PDF):
Gutschriften, Storno-Verrechnungen, Saldo. Ein-Klick-Freigabe durch Admin.

### 4.5 VAG-45b-Offenlegung
Pro Kunde generierbares Dokument: "Entschädigung des Vermittlers" aus den
effektiven Courtagen seiner Policen → in die Dokumenten-Ablage des Kunden.

## 5. Innovationen (Differenzierung)

| ⭐ Feature | Nutzen |
|---|---|
| **KI-Abrechnungsabgleich** | Stunden manueller Excel-Abgleich → Minuten; findet entgangene Courtagen (zahlt das SaaS-Abo selbst) |
| **Leakage-Detektor** | permanente Liste: Policen ohne Courtage-Eingang, ausgebliebene Bestandescourtagen |
| **Courtage-Forecast** | 12-Monats-Vorschau aus Bestandescourtagen + Renewal-Pipeline (MRR-Sicht des Maklerbestands) |
| **Storno-Radar 2.0** | exponierte Provisionssumme (offene Haftung) je Berater/Versicherer als Risiko-Kennzahl, statt nur Kalender-Reminder |
| **Insurer-Benchmark** (opt-in, anonymisiert) | effektive Sätze je Sparte über alle Tenants → Verhandlungsmacht gegenüber Versicherern |
| **VAG-45b-Generator** | Compliance auf Knopfdruck |

## 6. Phasenplan

| Phase | Inhalt | Abhängigkeit |
|---|---|---|
| **1 — Fundament** | Datenmodell (SQL #17), Courtagevereinbarungen-UI, automatische Soll-Stellung aus Police, Commissions-Seite mit Soll/Ist + Police-/Kundenbezug, Erfassen/Bearbeiten | keine — sofort baubar |
| **2 — Abgleich** | Statement-Upload, KI-Extraktion, Auto-Matching, Abweichungs-Dashboard, Leakage-Liste | Backend deployed (Gemini-Proxy) |
| **3 — Splits & Storno** | Split-Regelwerk, Auszahlungsabrechnungen (PDF), Clawback-Verrechnung | Phase 1 |
| **4 — Intelligence** | Forecast, Storno-Radar 2.0, Benchmark, VAG-45b-Generator | Phasen 1–3 |

---

*Konzept erstellt 2026-06; Umsetzung beginnt erst nach Freigabe.*
