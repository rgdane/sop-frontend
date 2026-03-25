import { formatDate } from "@/lib/formatDate";

type ModelMap = Record<string, { id: number; name: string }[]>;

export function transformMessage(
  html: string,
  models: ModelMap,
  dateKeys: string[]
): string {
  let out = html;

  Object.entries(models).forEach(([col, list]) => {
    const re = new RegExp(
      `<div>${col}: <span style="opacity:50%"><s>(\\d+)<\\/s><\\/span> (\\d+)<\\/div>`,
      "g"
    );
    out = out.replace(re, (_, oldId, newId) => {
      const oldObj = list.find((u) => u.id === +oldId);
      const newObj = list.find((u) => u.id === +newId);
      const oldName = oldObj?.name ?? ``;
      const newName = newObj?.name ?? `#${newId}`;
      const label = col.replace(/_id$/, "");
      if (oldName === newName) return "";
      return `<div>${label}: <span style="opacity:50%"><s>${oldName}</s></span> ${newName}</div>`;
    });

    const reWithoutOld = new RegExp(
      `<div>${col}: <span style="opacity:50%"><s><nil><\\/s><\\/span> (\\d+)<\\/div>`,
      "g"
    );
    out = out.replace(reWithoutOld, (_, newId) => {
      const newObj = list.find((u) => u.id === +newId);
      const newName = newObj?.name ?? `#${newId}`;
      const label = col.replace(/_id$/, "");
      return `<div>${label}: ${newName}</div>`;
    });
  });

  dateKeys.forEach((col) => {
    const re = new RegExp(
      `<div>${col}: <span style="opacity:50%"><s>(.*?)<\\/s><\\/span> (.*?)<\\/div>`,
      "g"
    );
    out = out.replace(re, (_, oldVal, newVal) => {
      // Validate dates before processing
      if (!oldVal || !newVal || oldVal.trim() === "" || newVal.trim() === "") {
        return "";
      }

      const oldDate = new Date(oldVal);
      const newDate = new Date(newVal);

      // Check if dates are valid
      if (isNaN(oldDate.getTime()) || isNaN(newDate.getTime())) {
        return "";
      }

      const oldDateStr = oldDate.toISOString().slice(0, 10);
      const newDateStr = newDate.toISOString().slice(0, 10);

      if (oldDateStr === newDateStr) return "";

      return (
        `<div>${col.replace(/_/, " ")}: ` +
        `<span style="opacity:50%"><s>${formatDate(oldVal)}</s></span> ` +
        `${formatDate(newVal)}</div>`
      );
    });
  });

  out = out.replace(
    /<div>([^:]+):\s*<span style="opacity:50%"><s>(.*?)<\/s><\/span>\s*({.*})<\/div>/gi,
    (_, col, oldValRaw, newValRaw) => {
      let newJson = null;
      try {
        newJson = JSON.parse(newValRaw);
      } catch {
        return _;
      }
      if (newJson?.type === "doc" && Array.isArray(newJson.content)) {
        const label = col
          .replace(/_id$/i, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        return `<div>${label} changed</div>`;
      }
      return _;
    }
  );

  out = out.replace(/<p><\/p>/g, "").trim();

  const textContent = out
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (
    !textContent ||
    /^.+updated:$/.test(textContent) ||
    /^.+created$/.test(textContent) ||
    (textContent.includes("updated") && !out.includes("<div"))
  ) {
    return "";
  }

  out = out.replace(/<div>([^:]+):/g, (_, col) => {
    const cleanCol = col.replace(/_id$/, "");
    const capitalized = cleanCol
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return `<div>${capitalized}:`;
  });

  out = out.replace("<p> updated", "<p>System updated");
  out = out.replace("<p> created", "<p>System created");

  return out;
}
