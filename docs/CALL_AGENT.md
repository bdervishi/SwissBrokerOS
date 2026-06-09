# Call Agent – concept, architecture & compliance

Goal: a per-tenant AI voice agent that can **place outbound calls** to a tenant's
customers, **transcribe** them, and **trigger follow-up actions** (notes, tasks,
appointments, leads) in SwissBroker OS.

> ⚠️ This document is engineering + compliance *guidance*, **not legal advice**.
> Automated/recorded outbound calling in Switzerland is legally sensitive — have
> the final setup reviewed by a Swiss data-protection / UWG lawyer before going
> live.

---

## 1. Current state
`pages/CallAgent.tsx` is an **in-browser voice demo** using the Gemini Live API
(mic → model → audio reply, WebAudio). It is **not** telephony: it makes no PSTN
calls, stores no transcript, triggers no follow-ups, and needs a client-side key
(`VITE_GEMINI_LIVE_KEY`, a cost/security risk). Treat it as a "live assist"
prototype only.

## 2. Target architecture (3 building blocks)
```
[ Trigger ]            [ Voice call (real time) ]        [ After the call ]
 broker / automation -> telephony + STT↔LLM↔TTS  -> transcript+recording -> AI post-call
   POST /calls/initiate     (provider)                webhook /calls/webhook   -> follow-up actions
```

### A. Telephony + realtime voice
Two realistic paths:

| Approach | What it is | Pros | Cons |
|---|---|---|---|
| **Managed voice-agent** (Vapi, Retell AI, Bland AI) | Platform wraps PSTN + realtime STT/LLM/TTS + function-calling + transcript webhooks | Fastest (days), barge-in/latency solved, per-agent config, transcripts + recordings included | US-hosted (data transfer), per-minute cost, vendor lock-in |
| **Self-build** (Twilio/Vonage **Media Streams** + Gemini Live / OpenAI Realtime) | You stream call audio to a realtime model yourself | Full control, choose model/region | Much more engineering (audio framing, barge-in, latency, retries), you own STT/TTS quality |

**Recommendation:** start with a **managed platform** (Vapi or Retell) behind an
adapter interface, so the app isn't locked in. Self-build later if needed.

### B. Post-call pipeline (fully buildable in-house now)
Independent of telephony: a transcript (from the provider, or an uploaded/Drive
recording transcribed via Whisper/Google STT) → **Gemini** summarises + extracts
structured outcomes → the app creates follow-up actions. This reuses the existing
AI proxy + data layer and can be built and tested **without any telephony account**.

## 3. Per-tenant model
Each tenant brings its **own number + agent** (like the drive integrations):
- Store per-tenant provider config/keys in `tenant_integrations`
  (`provider_code = 'voice_vapi'` / `'voice_retell'`, `encrypted_credentials` =
  { api_key, agent_id, phone_number_id }). Reuses the existing encryption + RLS.
- The backend uses the tenant's credentials to initiate calls and validate webhooks.

## 4. Data model (new)
`database_calls.sql` (to add):
```sql
create table public.calls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tenant_id uuid references public.tenants(id),
  client_id uuid references public.clients(id),
  agent_id uuid references public.profiles(id),        -- who triggered it
  direction text default 'OUTBOUND',
  to_number text,
  status text default 'QUEUED',                         -- QUEUED|RINGING|IN_PROGRESS|COMPLETED|FAILED|NO_ANSWER
  provider text,                                        -- vapi|retell|twilio
  provider_call_id text,
  recording_url text,
  transcript text,
  summary text,
  outcome jsonb,                                        -- { sentiment, intent, actions:[...] }
  duration_seconds int,
  consent_captured boolean default false
);
-- RLS: tenant isolation (tenant_id = current_tenant_id() or is_saas_admin())
```

## 5. Backend endpoints (new, in `backend/`)
- `POST /api/calls/initiate` (JWT, tenant-checked) → look up tenant voice creds,
  call the provider API to start a call with the client context + a system prompt;
  insert a `calls` row (status QUEUED).
- `POST /api/calls/webhook/:provider` → provider posts status + transcript +
  recording; **validate signature**; update the `calls` row; on COMPLETED run the
  post-call automation.
- `POST /api/calls/:id/process` → manual re-run of the post-call automation.

### Post-call automation (transcript → actions)
Gemini parses the transcript into a JSON outcome, then the backend creates:
- a **client note** (call summary),
- **tasks / calendar events** for agreed next steps (e.g. "Offerte senden",
  "Rückruf am …"),
- a **lead** update or new lead if relevant,
- updates the `calls.outcome`.
All via the existing `db` services / tables.

## 6. Frontend
- Client page: **"Anruf starten"** (pick purpose → calls `/initiate`).
- A **call history** per client (from `calls`) with transcript + summary + actions.
- The in-browser Live agent stays as an optional "practice / co-pilot" tool.

## 7. Compliance (Switzerland) — must-haves
**Not legal advice. Review with counsel.**

1. **Recording consent (StGB Art. 179bis/ter):** recording a non-public
   conversation without the other party's knowledge is a criminal offence. The
   agent **must announce at the start** that the call is recorded/AI-assisted and
   obtain consent; store `consent_captured` + the consent moment. No consent → no
   recording (and arguably no call).
2. **AI disclosure:** state clearly that the caller is an AI assistant.
3. **revDSG (data protection, in force 09/2023):** recordings/transcripts are
   personal data → need a lawful basis, an up-front information notice
   (privacy policy), purpose limitation, retention limits, and data-subject rights
   (access/deletion). Keep a processing record.
4. **Cross-border transfer:** Vapi/Retell/OpenAI are US-hosted → need a DPA +
   Swiss/EU SCCs and a transfer-impact assessment; prefer **EU data residency**
   options where offered, or a self-build with an EU-hosted model.
5. **UWG (unfair competition, Art. 3(1) lit. u/v):** no advertising calls to
   people who don't want them or whose directory entry has a **"\*" (Stern)**;
   must transmit a valid caller ID; only call numbers you're entitled to call.
   Cold-calling for acquisition is heavily restricted — prefer calling **existing
   customers** with a relationship/consent.
6. **Opt-out:** honour "do not call" immediately; maintain a suppression list.
7. **Retention:** define and enforce a recording/transcript retention period.

## 8. Phased roadmap
- **Phase 1 (no telephony, buildable now):** `calls` table + post-call pipeline
  (transcript/upload → AI → follow-up actions). Immediate value, fully testable.
- **Phase 2:** managed-provider adapter (Vapi/Retell) behind `POST /calls/initiate`
  + signed webhook → live outbound calls, per-tenant creds, consent capture.
- **Phase 3:** call history UI, suppression list, retention jobs, analytics.
- **Phase 4 (optional):** self-build realtime (Twilio Media Streams + EU model)
  for control/data-residency.

## 9. Cost (order of magnitude)
- Managed voice agents: ~CHF 0.05–0.15 / min (platform) **+** telephony **+** LLM/STT/TTS.
- Self-build: telephony (~0.01–0.03/min) + STT + LLM + TTS separately.
Budget per-tenant rate limits and monthly caps (like the AI proxy limiter).

## 10. Risks
- Legal (consent/UWG/transfer) — the biggest; gate go-live on legal sign-off.
- Latency/quality of realtime voice; brand risk of a bad AI call.
- Cost runaway → enforce caps.
- Provider lock-in → keep the adapter interface thin.
