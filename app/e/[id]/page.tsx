import Room from "./Room";
import type { Role } from "@/lib/types";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ who?: string }>;
}) {
  const { id } = await params;
  const { who } = await searchParams;
  const role: Role = who === "guest" ? "guest" : "host";
  return <Room id={id} who={role} />;
}
