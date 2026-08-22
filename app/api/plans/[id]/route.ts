import { NextResponse } from "next/server";
import { getPublicPlan } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const plan = await getPublicPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }
  return NextResponse.json({ plan });
}
