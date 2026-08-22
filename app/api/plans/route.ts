import { NextResponse } from "next/server";
import { isDiscordWebhook } from "@/lib/discord";
import { createPlan } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title || "").trim();
  const place = String(body.place || "").trim();
  const time = String(body.time || "").trim();
  const webhookUrl = String(body.webhookUrl || "").trim();
  const hostName = String(body.hostName || "").trim();
  const guestName = String(body.guestName || "").trim();
  const hostMention = String(body.hostMention || "").trim();
  const guestMention = String(body.guestMention || "").trim();

  if (!title || !time || !hostName || !guestName) {
    return NextResponse.json(
      { error: "Need title, time, host name, and guest name." },
      { status: 400 }
    );
  }
  if (!webhookUrl || !isDiscordWebhook(webhookUrl)) {
    return NextResponse.json(
      { error: "Paste a Discord webhook URL (discord.com/api/webhooks/…)." },
      { status: 400 }
    );
  }
  if (Number.isNaN(new Date(time).getTime())) {
    return NextResponse.json({ error: "Invalid time." }, { status: 400 });
  }

  const plan = await createPlan({
    title,
    place,
    time: new Date(time).toISOString(),
    webhookUrl,
    hostName,
    guestName,
    hostMention,
    guestMention,
  });

  return NextResponse.json({ plan });
}
