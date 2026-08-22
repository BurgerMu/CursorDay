import { NextResponse } from "next/server";
import { discordPayload, sendDiscord } from "@/lib/discord";
import { claimAlarmPing } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const force = Boolean(body.force);

  const claimed = await claimAlarmPing(id, force);
  if (!claimed) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await sendDiscord(
    claimed.plan.webhookUrl,
    discordPayload(claimed.plan, claimed.reminder)
  );
  return NextResponse.json({ ok: true, sent: true, reminder: claimed.reminder });
}
