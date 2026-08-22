import { NextResponse } from "next/server";
import { icsForPlan } from "@/lib/ics";
import { getPlan } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }
  return new NextResponse(icsForPlan(plan), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${plan.id}.ics"`,
    },
  });
}
