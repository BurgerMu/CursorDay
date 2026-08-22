import type { Plan } from "./types";

function stamp(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function icsForPlan(plan: Plan) {
  const start = new Date(plan.time);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const uid = `${plan.id}@showup.local`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SHOWUP//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(start.toISOString())}`,
    `DTEND:${stamp(end.toISOString())}`,
    `SUMMARY:${plan.title}`,
    `DESCRIPTION:Both ${plan.hostName} and ${plan.guestName} must confirm on SHOWUP.`,
    `LOCATION:${plan.place || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
