"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicPlan } from "@/lib/types";

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PlanCard({ plan }: { plan: PublicPlan }) {
  const notified = Boolean(plan.alarmSentAt);
  return (
    <a className="plan-card" href={`/e/${plan.id}?who=host`}>
      <strong>{plan.title}</strong>
      <span className="plan-time">{formatWhen(plan.time)}</span>
      {plan.place ? <span className="plan-place">{plan.place}</span> : null}
      <span className="plan-people">
        {plan.hostName} + {plan.guestName}
      </span>
      <em className={notified ? "badge sent" : "badge pending"}>
        {notified ? "Notified Discord" : "Not yet notified"}
      </em>
    </a>
  );
}

export default function PlansRail() {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<PublicPlan[]>([]);

  async function load() {
    try {
      const res = await fetch("/api/plans", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setPlans(data.plans as PublicPlan[]);
    } catch {
      /* keep last list */
    }
  }

  useEffect(() => {
    load();
    const poll = setInterval(load, 4000);
    return () => clearInterval(poll);
  }, []);

  const { notified, pending } = useMemo(() => {
    const notified = plans.filter((p) => p.alarmSentAt);
    const pending = plans.filter((p) => !p.alarmSentAt);
    return { notified, pending };
  }, [plans]);

  return (
    <>
      <button
        className={`plans-tab ${open ? "open" : ""}`}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Plans
        <small>{plans.length}</small>
      </button>
      <aside className={`plans-rail ${open ? "open" : ""}`}>
        <header className="plans-head">
          <h2>All plans</h2>
          <button type="button" className="plans-close" onClick={() => setOpen(false)}>
            Close
          </button>
        </header>
        <p className="plans-lede">
          Everything already pinged to Discord, and plans still waiting.
        </p>
        <section>
          <h3>Already notified</h3>
          {notified.length ? (
            notified.map((plan) => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <p className="plans-empty">No Discord pings yet.</p>
          )}
        </section>
        <section>
          <h3>Not yet notified</h3>
          {pending.length ? (
            pending.map((plan) => <PlanCard key={plan.id} plan={plan} />)
          ) : (
            <p className="plans-empty">Every plan has been pinged.</p>
          )}
        </section>
      </aside>
      {open ? (
        <button
          type="button"
          className="plans-scrim"
          aria-label="Close plans"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
