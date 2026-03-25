import { Language } from "@/types/data/language.types";
export const formatDictionary = (
  data: Language[]
): Record<string, Record<string, string>> => {
  const formatted: Record<string, Record<string, string>> = {};

  for (const item of data) {
    formatted[item.prefix] = {
      en: item.ens,
      id: item.ids,
    };
  }

  return formatted;
};
