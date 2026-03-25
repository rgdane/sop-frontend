import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("id");

export function formatRelativeTime(dateStr: string) {
  const now = dayjs();
  const date = dayjs(dateStr);

  const diffHours = now.diff(date, "hour");
  const diffDays = now.diff(date, "day");
  const diffWeeks = now.diff(date, "week");
  const diffMonths = now.diff(date, "month");

  if (diffHours < 24) return date.fromNow();
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`;
  if (diffMonths < 1) return "sebulan yang lalu";
  return date.format("DD MMM YYYY HH:mm");
}