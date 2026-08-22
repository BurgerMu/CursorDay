"use client";

import { FormEvent, useMemo, useState } from "react";
import PlansRail from "./PlansRail";

function defaultTime() {
  const d = new Date(Date.now() + 3 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HomePage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{
    id: string;
    hostName: string;
    guestName: string;
  } | null>(null);

  const origin = useMemo(
    () => (typeof window === "undefined" ? "" : window.location.origin),
    []
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create plan.");
      setCreated({
        id: data.plan.id,
        hostName: data.plan.hostName,
        guestName: data.plan.guestName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <div className="brand">
        <span>SHOWUP 1P</span>
        <small>INSERT COIN · both confirm</small>
      </div>
      <div className="hud-bar">
        <span>STAGE 01 · MAKE PLAN</span>
        <span>HP ████████</span>
        <span>DISCORD READY</span>
      </div>
      <section className="ticket">
        <h1>Make a plan. Both of you tap. Discord handles the rest.</h1>
        <p className="lede">
          Host and guest each get a link. If the time hits and one person never
          taps I&apos;m here, we post to your Discord channel. No GPS. The screen
          is the proof.
        </p>

        {created ? (
          <div className="links">
            <p>Send these. Open both in two windows for the demo.</p>
            <a href={`/e/${created.id}?who=host`}>
              Host · {created.hostName}: {origin}/e/{created.id}?who=host
            </a>
            <a href={`/e/${created.id}?who=guest`}>
              Guest · {created.guestName}: {origin}/e/{created.id}?who=guest
            </a>
            <div className="actions">
              <button type="button" onClick={() => setCreated(null)}>
                Back to main page
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label>
              Plan
              <input name="title" required placeholder="Breakfast / catch the BTS" />
            </label>
            <div className="row two">
              <label>
                Place
                <input name="place" placeholder="Siam / Discord VC" />
              </label>
              <label>
                Time
                <input name="time" type="datetime-local" required defaultValue={defaultTime()} />
              </label>
            </div>
            <div className="row two">
              <label>
                Host name (appointer)
                <input name="hostName" required placeholder="Aom" />
              </label>
              <label>
                Guest name (appointee)
                <input name="guestName" required placeholder="Bank" />
              </label>
            </div>
            <div className="row two">
              <label>
                Host Discord ping (optional)
                <input name="hostMention" placeholder="@Aom or <@userId>" />
              </label>
              <label>
                Guest Discord ping (optional)
                <input name="guestMention" placeholder="@Bank or <@userId>" />
              </label>
            </div>
            <label>
              Discord webhook URL
              <input
                name="webhookUrl"
                type="url"
                required
                placeholder="https://discord.com/api/webhooks/…"
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Create check-in"}
            </button>
          </form>
        )}
      </section>
      <PlansRail />
    </main>
  );
}
