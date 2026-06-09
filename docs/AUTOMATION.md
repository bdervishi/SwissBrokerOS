# Automation

## Deadline automation (built)
A daily backend cron (`06:00`, `backend/src/automation.ts`) scans the database
and creates `calendar_events` for upcoming deadlines — **idempotent** (never
duplicates the same related_id + type + day):

- **Policy cancellation deadlines** – `end_date` minus `cancellation_notice_period`
  months, within the next 90 days (type `DEADLINE`).
- **Mortgage expiry** – `mortgages.end_date` within 90 days (type `DEADLINE`).
- **Client birthdays** – next birthday within 30 days (type `BIRTHDAY`).

Generated events appear automatically in the app's **Calendar** and the
Dashboard "upcoming events". Requires the backend to be deployed with
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

### Manual trigger
```
curl -X POST https://<backend>/api/automation/run -H "x-automation-key: <AUTOMATION_SECRET>"
```

## Roadmap (not yet built)
- **Calendar sync** (Google/MS): two-way sync of calendar_events with the
  connected provider's calendar (reuses the drive OAuth tokens + a calendar scope).
- **Storno watch**: tasks for policies inside their clawback window.
- **Lead follow-up**: tasks for leads with no activity for N days.
- **AI document extraction**: pull policy/client fields from drive PDFs.
- **Inbox automation**: classify incoming mail → tasks/leads + draft replies.
