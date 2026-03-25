export const formatColor = (color: any): string => {
  if (!color) return "";
  if (typeof color === "string") return color;
  if (typeof color.toHexString === "function") return color.toHexString();
  return String(color);
};