import { NextResponse } from "next/server";
import { confirmRole } from "@/lib/store";
import type { Role } from "@/lib/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const role = body.role as Role;
  if (role !== "host" && role !== "guest") {
    return NextResponse.json({ error: "Role must be host or guest." }, { status: 400 });
  }
  const plan = await confirmRole(id, role);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }
  return NextResponse.json({ plan });
}
