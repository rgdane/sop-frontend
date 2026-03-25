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
