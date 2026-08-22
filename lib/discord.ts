import type { Plan, Role } from "./types";

function ping(plan: Plan, role: Role) {
  const name = role === "host" ? plan.hostName : plan.guestName;
  const mention =
    role === "host" ? plan.hostMention : plan.guestMention;
  return mention.trim() ? mention.trim() : `**${name}**`;
}

export function discordPayload(plan: Plan) {
  const missing: Role[] = [];
  if (!plan.hostConfirmedAt) missing.push("host");
  if (!plan.guestConfirmedAt) missing.push("guest");

  const who = missing.map((role) => ping(plan, role)).join(" and ");
  const when = new Date(plan.time).toLocaleString();
  const place = plan.place ? ` @ ${plan.place}` : "";

  return {
    content: `${who} — confirm on SHOWUP. The plan already started.`,
    embeds: [
      {
        title: `LATE · ${plan.title}`,
        description: `${plan.hostName} (host) and ${plan.guestName} (guest) both have to tap **I'm here**.\nMissing: ${missing.join(", ") || "nobody"}.`,
        color: 0xc1121f,
        fields: [
          { name: "When", value: when, inline: true },
          { name: "Where", value: plan.place || "—", inline: true },
        ],
        footer: { text: `SHOWUP · both must confirm${place}` },
      },
    ],
  };
}

export async function sendDiscord(webhookUrl: string, payload: unknown) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed (${res.status}): ${text}`);
  }
}

export function isDiscordWebhook(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "discord.com" ||
        parsed.hostname === "discordapp.com") &&
      parsed.pathname.startsWith("/api/webhooks/")
    );
  } catch {
    return false;
  }
}
