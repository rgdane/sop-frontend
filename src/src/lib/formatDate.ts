import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/id";

dayjs.locale("id");
dayjs.extend(utc);

export const formatDate = (isoDate: string, time: boolean = false): string => {
  const date = new Date(isoDate);

  const dateStr = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!time) return dateStr;

  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(".", ":");

  return `${dateStr} ${timeStr}`;
};

export const formatDateToIso = (date: string): string => {
  const parsed = dayjs(date, "DD-MM-YYYY").utc().add(7, "hour");
  return parsed.format("YYYY-MM-DDTHH:mm:ss[Z]");
};

export const formatDateTimeWithDay = (date: Date = new Date()): string => {
  const weekday = date.toLocaleDateString("id-ID", { weekday: "long" });
  const day = date.toLocaleDateString("id-ID", { day: "numeric" });
  const month = date.toLocaleDateString("id-ID", { month: "long" });
  
  const time = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(/\./g, ":");
  
  return `${weekday}, ${day} ${month} - ${time}`;
};
