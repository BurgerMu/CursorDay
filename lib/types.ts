export type Role = "host" | "guest";

export type Plan = {
  id: string;
  title: string;
  place: string;
  time: string;
  webhookUrl: string;
  hostName: string;
  guestName: string;
  hostMention: string;
  guestMention: string;
  hostConfirmedAt: string | null;
  guestConfirmedAt: string | null;
  alarmSentAt: string | null;
  successSentAt: string | null;
  createdAt: string;
};

export type PublicPlan = Omit<Plan, "webhookUrl"> & {
  bothConfirmed: boolean;
  missing: Role[];
  isDue: boolean;
};
