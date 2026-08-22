import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plan, PublicPlan, Role } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "plans.json");

let writeChain: Promise<void> = Promise.resolve();

function toPublic(plan: Plan): PublicPlan {
  const missing: Role[] = [];
  if (!plan.hostConfirmedAt) missing.push("host");
  if (!plan.guestConfirmedAt) missing.push("guest");
  return {
    id: plan.id,
    title: plan.title,
    place: plan.place,
    time: plan.time,
    hostName: plan.hostName,
    guestName: plan.guestName,
    hostMention: plan.hostMention,
    guestMention: plan.guestMention,
    hostConfirmedAt: plan.hostConfirmedAt,
    guestConfirmedAt: plan.guestConfirmedAt,
    alarmSentAt: plan.alarmSentAt,
    successSentAt: plan.successSentAt,
    createdAt: plan.createdAt,
    bothConfirmed: missing.length === 0,
    missing,
    isDue: Date.now() >= new Date(plan.time).getTime(),
  };
}

async function readAll(): Promise<Record<string, Plan>> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Record<string, Plan>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, Plan>) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function queueWrite<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function createPlan(
  input: Omit<
    Plan,
    | "id"
    | "createdAt"
    | "hostConfirmedAt"
    | "guestConfirmedAt"
    | "alarmSentAt"
    | "successSentAt"
  >
): Promise<PublicPlan> {
  return queueWrite(async () => {
    const all = await readAll();
    const id = crypto.randomUUID().slice(0, 8);
    const plan: Plan = {
      ...input,
      id,
      hostConfirmedAt: null,
      guestConfirmedAt: null,
      alarmSentAt: null,
      successSentAt: null,
      createdAt: new Date().toISOString(),
    };
    all[id] = plan;
    await writeAll(all);
    return toPublic(plan);
  });
}

export async function getPlan(id: string): Promise<Plan | null> {
  const all = await readAll();
  return all[id] ?? null;
}

export async function getPublicPlan(id: string): Promise<PublicPlan | null> {
  const plan = await getPlan(id);
  return plan ? toPublic(plan) : null;
}

export async function listPublicPlans(): Promise<PublicPlan[]> {
  const all = await readAll();
  return Object.values(all)
    .map(toPublic)
    .sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
}

export async function confirmRole(
  id: string,
  role: Role
): Promise<PublicPlan | null> {
  return queueWrite(async () => {
    const all = await readAll();
    const plan = all[id];
    if (!plan) return null;
    const now = new Date().toISOString();
    if (role === "host") plan.hostConfirmedAt = now;
    else plan.guestConfirmedAt = now;
    all[id] = plan;
    await writeAll(all);
    return toPublic(plan);
  });
}

export async function claimSuccessPing(id: string): Promise<Plan | null> {
  return queueWrite(async () => {
    const all = await readAll();
    const plan = all[id];
    if (!plan) return null;
    if (!plan.hostConfirmedAt || !plan.guestConfirmedAt) return null;
    if (plan.successSentAt) return null;
    plan.successSentAt = new Date().toISOString();
    all[id] = plan;
    await writeAll(all);
    return plan;
  });
}

export async function clearSuccessSent(id: string): Promise<void> {
  await queueWrite(async () => {
    const all = await readAll();
    const plan = all[id];
    if (!plan) return;
    plan.successSentAt = null;
    all[id] = plan;
    await writeAll(all);
  });
}

export async function markAlarmSent(id: string): Promise<Plan | null> {
  return queueWrite(async () => {
    const all = await readAll();
    const plan = all[id];
    if (!plan) return null;
    plan.alarmSentAt = new Date().toISOString();
    all[id] = plan;
    await writeAll(all);
    return plan;
  });
}

export { toPublic };
