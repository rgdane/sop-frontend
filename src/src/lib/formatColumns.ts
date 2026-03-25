import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatNumber } from "./formatNumber";

dayjs.extend(utc);

export function formatDateToIso(date: string | Dayjs | null): string | null {
  if (!date) return null;
  return dayjs(date).utc().add(7, "hour").format("YYYY-MM-DDTHH:mm:ss");
}

export function formatMultiSelectField(value: any[]): number[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "object" && item !== null && "value" in item) {
        return item.value;
      }
      return item;
    })
    .filter((val): val is number => typeof val === "number");
}

type ColumnDefinition<T> = {
  dataIndex?: keyof T;
  key?: string;
  inputType?: string;
};

/**
 * Formats form values based on column input types.
 * Ensures return type matches Partial<T> correctly.
 */
export const formatColumns = async <T>(
  values: Partial<T>,
  columns: ColumnDefinition<T>[]
): Promise<Partial<T>> => {
  const formattedValues: Partial<T> = { ...values };

  columns.forEach((col) => {
    const key = col.dataIndex ?? (col.key as keyof T);
    if (!key) return;

    const inputType = col.inputType;
    const value = formattedValues[key];

    switch (inputType) {
      case "multiSelect":
        formattedValues[key] = formatMultiSelectField(
          value as any[]
        ) as T[keyof T];
        break;
      case "date":
        formattedValues[key] = formatDateToIso(value as any) as T[keyof T];
        break;
      case "dateRange":
        if (Array.isArray(value) && value.length === 2) {
          const [startDate, endDate] = value;
          if (key === "date_range") {
            delete formattedValues[key];
            (formattedValues as any).start_date = formatDateToIso(startDate);
            (formattedValues as any).end_date = formatDateToIso(endDate);
          }
        }
        break;
      case "time":
        if (Array.isArray(value) && value.length === 2) {
          const [startTime, endTime] = value;
          if (startTime && endTime) {
            const startFormatted = dayjs(startTime).format("HH.mm");
            const endFormatted = dayjs(endTime).format("HH.mm");
            formattedValues[key] = `${startFormatted} - ${endFormatted} WIB` as T[keyof T];
          }
        }
        break;
      default:
        break;
    }
  });

  return formattedValues;
};
