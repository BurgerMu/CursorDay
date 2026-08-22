# SHOWUP

Mutual check-in for plans. Host and guest each tap **I'm here**. If the time hits and one of them has not confirmed, Discord gets a webhook ping.

## Flow

1. Host creates a plan (title, time, place, names, Discord webhook).
2. System issues two links: `?who=host` and `?who=guest`.
3. Each person opens their link and taps **I'm here** (proof they are at a screen).
4. Shared state updates every 2 seconds.
5. When the appointment time is reached and both have not confirmed, the open tab calls `/api/plans/:id/alarm` once.
6. **Ping Discord now** forces the same message for the live demo.
7. Optional: download `.ics` for Google / Android calendar.

```
Create plan
    ↓
Two role links
    ↓
Waiting  →  one confirmed  →  both confirmed (done)
                ↓ after time (or demo button)
            Discord webhook (names still missing)
```

## System

| Piece | What it does |
|---|---|
| Next.js app | Pages + API |
| `.data/plans.json` | Local store (good for a laptop demo) |
| `POST /api/plans` | Create |
| `GET /api/plans/:id` | Public status (no webhook secret) |
| `POST /api/plans/:id/confirm` | One role confirms |
| `POST /api/plans/:id/alarm` | Discord ping |
| `GET /api/plans/:id/ics` | Calendar file |

Webhook URL stays on the server. Discord user IDs (`<@id>`) are optional in the mention fields.

Keep a tab open for auto-alarm. There is no background worker.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

Discord: Server Settings → Integrations → Webhooks → New Webhook → copy URL.
