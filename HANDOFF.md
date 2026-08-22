# SHOWUP — chat handoff

**Event:** Cursor Build Salaya, 22 Aug 2026  
**Product:** Mutual check-in. If a friend made a plan and does not confirm, Discord pings them.

## Decision

We do **not** use GPS, camera, or Android alarm APIs.  
“Awake / arrived / at the screen” = **both people opened the app and tapped I’m here.**

- **Host (appointer)** and **guest (appointee)** each get their own link.
- Success = both confirmed.
- If time is up and someone is missing → Discord webhook (once).
- Google/Android calendar is **optional** via `.ics` download (no OAuth).

## What is built

Next.js app in this repo. `npm install` already done. `next build` succeeded.

| Path | What |
|---|---|
| `app/page.tsx` | Create plan + two share links |
| `app/e/[id]/Room.tsx` | Countdown, confirm, “Ping Discord now” |
| `app/api/plans/` | Create, status, confirm, alarm, `.ics` |
| `lib/store.ts` | Local JSON store (`.data/plans.json`) |
| `lib/discord.ts` | Webhook message |

Keep a check-in **tab open** for auto-ping. No background cron.

## Run

```bash
npm run dev
```

Open http://localhost:3000

1. Discord channel → Integrations → Webhooks → copy URL.
2. Create a plan (default time is ~3 minutes ahead).
3. Open host link in one window, guest in another.
4. Confirm only one side → **Ping Discord now** (or wait for time).

## Demo script (5 min)

Create “Lunch”, host confirms, guest does not, Discord names the guest, guest taps I’m here → **BOTH HERE**.

## Not done / next if there is time

- Deploy to Vercel (file store will not persist well on serverless; fine for local demo).
- Thai copy.
- Real Discord `<@userId>` mentions (fields already exist).
- Do not start Google Calendar API.

## New chat prompt (paste this)

We are building SHOWUP in this repo: mutual host/guest confirm + Discord webhook if someone is late. Calendar is optional `.ics` only. Do not add GPS. Run `npm run dev` and help with [deploy / Thai UI / demo polish].
