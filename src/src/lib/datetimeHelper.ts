import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

// Normalize any input to Dayjs
const toDayjs = (value: Date | string | any) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

/**
 * Convert date/date string/dayjs → RFC3339Nano (valid Golang)
 * Output: 2025-12-04T16:14:14.212486+07:00
 */
export const toGolangTime = (value: Date | string | Dayjs, keepLocalTime = true) => {
  if (!value) return null;

  const d = keepLocalTime ? toDayjs(value) : toDayjs(value)?.utc();
  if (!d || !d.isValid()) return null;

  const formatted = d.format("YYYY-MM-DDTHH:mm:ss.SSSSSSZZ");
  return formatted.replace(/(\+\d{2})(\d{2})$/, "$1:$2");
};

/**
 * Parse RFC3339/RFC3339Nano → Date
 */
export const fromGolangTime = (value: string): Date | null => {
  if (!value) return null;

  const d = dayjs(value);
  return d.isValid() ? d.toDate() : null;
};

/**
 * Parse RFC3339 → Dayjs (for DatePicker)
 */
export const fromGolangTimeDayjs = (value: string): any | null => {
  if (!value) return null;

  const d = dayjs(value);
  return d.isValid() ? d : null;
};
