import { NextResponse } from "next/server";
import { discordPayload, sendDiscord } from "@/lib/discord";
import { getPlan, markAlarmSent } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const force = Boolean(body.force);

  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }

  const bothHere = Boolean(plan.hostConfirmedAt && plan.guestConfirmedAt);
  if (bothHere) {
    return NextResponse.json({ ok: true, skipped: "both_confirmed" });
  }

  const due = Date.now() >= new Date(plan.time).getTime();
  if (!due && !force) {
    return NextResponse.json({ ok: true, skipped: "not_due" });
  }
  if (plan.alarmSentAt && !force) {
    return NextResponse.json({ ok: true, skipped: "already_sent" });
  }

  await sendDiscord(plan.webhookUrl, discordPayload(plan));
  await markAlarmSent(id);
  return NextResponse.json({ ok: true, sent: true });
}
