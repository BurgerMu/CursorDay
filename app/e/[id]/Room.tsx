"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PlansRail from "@/app/PlansRail";
import type { PublicPlan, Role } from "@/lib/types";

function label(plan: PublicPlan, role: Role) {
  return role === "host" ? plan.hostName : plan.guestName;
}

export default function Room({ id, who }: { id: string; who: Role }) {
  const [plan, setPlan] = useState<PublicPlan | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const alarmLock = useRef(false);

  async function refresh() {
    const res = await fetch(`/api/plans/${id}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Missing plan.");
    setPlan(data.plan);
    return data.plan as PublicPlan;
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
    const poll = setInterval(() => {
      refresh().catch(() => undefined);
    }, 2000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [id]);

  useEffect(() => {
    if (!plan) return;
    if (plan.bothConfirmed || !plan.isDue) return;
    const last = plan.alarmSentAt ? new Date(plan.alarmSentAt).getTime() : 0;
    if (last && now - last < 60_000) return;
    if (alarmLock.current) return;
    alarmLock.current = true;
    fetch(`/api/plans/${id}/alarm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(() => refresh().catch(() => undefined))
      .finally(() => {
        alarmLock.current = false;
      });
  }, [plan, id, now]);

  const countdown = useMemo(() => {
    if (!plan) return "";
    const delta = new Date(plan.time).getTime() - now;
    if (delta <= 0) return "Time is up.";
    const s = Math.floor(delta / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `Starts in ${h}h ${m % 60}m ${s % 60}s`;
  }, [plan, now]);

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/plans/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: who }),
      });
      const data = await res.json();
      if (data.plan) setPlan(data.plan);
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed.");
    } finally {
      setBusy(false);
    }
  }

  async function shame() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/plans/${id}/alarm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Discord failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!plan && !error) {
    return (
      <main className="wrap">
        <p>Loading plan…</p>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="wrap">
        <p className="error">{error}</p>
      </main>
    );
  }

  const youHere = who === "host" ? plan.hostConfirmedAt : plan.guestConfirmedAt;

  return (
    <main className="wrap">
      <div className="brand">
        <a href="/">Back to main page</a>
        <small>PLAYER {who === "host" ? "1" : "2"} · {who}</small>
      </div>
      <div className="hud-bar">
        <span>{plan.bothConfirmed ? "CLEAR" : plan.isDue ? "DANGER" : "WAIT"}</span>
        <span>HP {plan.bothConfirmed ? "████████" : "████░░░░"}</span>
        <span>{countdown}</span>
      </div>
      <section className="ticket">
        {plan.bothConfirmed ? (
          <div className="stamp ok">BOTH HERE</div>
        ) : plan.isDue ? (
          <div className="stamp">LATE</div>
        ) : (
          <div className="stamp ok">WAITING</div>
        )}
        <h1>{plan.title}</h1>
        <div className="meta">
          <span>{plan.place || "No place set"}</span>
          <span>{new Date(plan.time).toLocaleString()}</span>
          <span>{countdown}</span>
        </div>
        <div className="people">
          {(["host", "guest"] as Role[]).map((role) => {
            const here =
              role === "host" ? plan.hostConfirmedAt : plan.guestConfirmedAt;
            return (
              <div
                key={role}
                className={`person ${here ? "here" : "missing"}`}
              >
                <strong>
                  {label(plan, role)} · {role}
                  {role === who ? " · you" : ""}
                </strong>
                <div className="status">{here ? "I'm here" : "Not yet"}</div>
              </div>
            );
          })}
        </div>
        <div className="actions">
          <button className="ok" disabled={busy || Boolean(youHere)} onClick={confirm}>
            {youHere ? "You confirmed" : "I'm here"}
          </button>
          <button className="late" disabled={busy || plan.bothConfirmed} onClick={shame}>
            Ping Discord now
          </button>
          <a className="btn" href={`/api/plans/${id}/ics`}>
            Add to calendar (.ics)
          </a>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <p className="note">
          Success = both cards say I&apos;m here. If time is up and a card is
          still empty, Discord gets the missing name, then pings again every
          1 minute until both confirm. Keep this tab open so the auto-ping can
          fire.
        </p>
      </section>
      <PlansRail />
    </main>
  );
}
