export type ScheduleOmnichannel = {
  id: number;
  date: string;
  session_1: boolean;
  session_2: boolean;
  status_session_1: "AVAILABLE" | "NOT_AVAILABLE" | null;
  status_session_2: "AVAILABLE" | "NOT_AVAILABLE" | null;
  deleted_at?: string | null;
};
