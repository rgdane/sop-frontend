import { History, HistoryChanges } from "@/types/data/history.types";
import { formatDate } from "@/lib/formatDate";

type ModelMap = Record<string, { id: number; name: string }[]>;
type User = { id: number; name: string };

/**
 * Generates a formatted HTML message from history changes
 * @param history - The history object from backend
 * @param users - Array of users to resolve user_id
 * @param models - Object mapping field names to arrays of objects with id and name
 * @param dateKeys - Array of field names that should be formatted as dates
 * @returns Formatted HTML string
 */
export function generateHistoryMessage(
  history: History,
  users: User[] = [],
  models: ModelMap = {},
  dateKeys: string[] = []
): string {
  const { action, changes, new_data, old_data, user_id } = history;
  
  // Get user name
  const user = users.find((u) => u.id === user_id);
  const userName = user?.name || "System";

  // Handle DELETE action
  if (action === "DELETE") {
    const itemName = old_data?.name || "item";
    return `<div><strong>${userName}</strong> menghapus <strong>${itemName}</strong></div>`;
  }

  // Handle CREATE action
  if (action === "CREATE") {
    const itemName = new_data?.name || "item";
    return `<div><strong>${userName}</strong> membuat <strong>${itemName}</strong></div>`;
  }

  // Handle UPDATE action
  if (action === "UPDATE" && changes) {
    const changeParts: string[] = [];
    Object.entries(changes).forEach(([field, change]) => {
      // Skip internal fields
      if (["updated_at", "created_at", "id"].includes(field)) {
        return;
      }

      const oldValue = change.old;
      const newValue = change.new;

      // Custom field labels mapping
      const fieldLabelMap: Record<string, string> = {
        has_assigned_users: "Customer Support",
        has_technicians: "Technical Support",
      };

      // Format field name
      const fieldLabel = fieldLabelMap[field] || field
        .replace(/_id$/, "")
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      // Handle array fields (has_assigned_users, has_technicians)
      if ((field === "has_assigned_users" || field === "has_technicians") && models[field]) {
        const oldArray = Array.isArray(oldValue) ? oldValue : [];
        const newArray = Array.isArray(newValue) ? newValue : [];

        // Get user names for old and new arrays
        const oldNames = oldArray
          .map((id: number) => {
            const item = models[field]?.find((u) => u.id === id);
            return item?.name || `#${id}`;
          })
          .filter(Boolean);

        const newNames = newArray
          .map((id: number) => {
            const item = models[field]?.find((u) => u.id === id);
            return item?.name || `#${id}`;
          })
          .filter(Boolean);

        // Check if there are actual changes
        const oldSet = new Set(oldArray);
        const newSet = new Set(newArray);
        const hasChanges = oldArray.length !== newArray.length || 
                          oldArray.some((id: number) => !newSet.has(id)) ||
                          newArray.some((id: number) => !oldSet.has(id));

        if (hasChanges) {
          const oldDisplay = oldNames.length > 0 ? oldNames.join(", ") : "None";
          const newDisplay = newNames.length > 0 ? newNames.join(", ") : "None";
          
          changeParts.push(
            `${fieldLabel}: <span style="opacity:0.5"><s>${oldDisplay}</s></span> → ${newDisplay}`
          );
        }
        return;
      }

      // Handle foreign key references (e.g., user_id, status_id)
      if (field.endsWith("_id") && models[field]) {
        const oldItem = models[field]?.find((item) => item.id === oldValue);
        const newItem = models[field]?.find((item) => item.id === newValue);

        const oldName = oldItem?.name || (oldValue ? `#${oldValue}` : "None");
        const newName = newItem?.name || (newValue ? `#${newValue}` : "None");

        if (oldName !== newName) {
          changeParts.push(
            `${fieldLabel}: <span style="opacity:0.5"><s>${oldName}</s></span> → ${newName}`
          );
        }
        return;
      }

      // Handle date fields
      if (dateKeys.includes(field)) {
        try {
          const oldDate = oldValue ? new Date(oldValue) : null;
          const newDate = newValue ? new Date(newValue) : null;

          if (
            oldDate &&
            newDate &&
            !isNaN(oldDate.getTime()) &&
            !isNaN(newDate.getTime())
          ) {
            const oldDateStr = oldDate.toISOString().slice(0, 10);
            const newDateStr = newDate.toISOString().slice(0, 10);

            if (oldDateStr !== newDateStr) {
              changeParts.push(
                `${fieldLabel}: <span style="opacity:0.5"><s>${formatDate(oldValue)}</s></span> → ${formatDate(newValue)}`
              );
            }
          }
        } catch {
          // Skip invalid dates
        }
        return;
      }


      // Try to parse if it's a string, otherwise use as is
      let parsedNewValue = newValue;
      if (typeof newValue === "string") {
        try {
          parsedNewValue = JSON.parse(newValue);
        } catch {
          // Not a valid JSON string, keep as string
        }
      }

      let parsedOldValue = oldValue;
      if (typeof oldValue === "string") {
        try {
          parsedOldValue = JSON.parse(oldValue);
        } catch {
          // Not a valid JSON string, keep as string
        }
      }

      if (
        typeof parsedNewValue === "object" &&
        parsedNewValue !== null &&
        !Array.isArray(parsedNewValue)
      ) {
        // Check if it's a Tiptap/ProseMirror document
        if (parsedNewValue.type === "doc" && Array.isArray(parsedNewValue.content)) {
          // Store JSON data for DiffViewerEditor component
          const oldJson = parsedOldValue && typeof parsedOldValue === "object" && parsedOldValue.type === "doc" ? parsedOldValue : null;
          const newJson = parsedNewValue;
          
          // Create a placeholder that will be replaced with DiffViewerEditor
          const diffId = `diff-${field}-${Date.now()}`;
          changeParts.push(
            `${fieldLabel}: <div class="history-diff-placeholder" data-diff-id="${diffId}" data-old-json='${JSON.stringify(oldJson)}' data-new-json='${JSON.stringify(newJson)}'>${fieldLabel} diubah</div>`
          );
        }
        return;
      }

      // Handle boolean fields
      if (typeof newValue === "boolean" || typeof oldValue === "boolean") {
        const oldText = oldValue ? "Yes" : "No";
        const newText = newValue ? "Yes" : "No";
        if (oldText !== newText) {
          changeParts.push(
            `${fieldLabel}: <span style="opacity:0.5"><s>${oldText}</s></span> → ${newText}`
          );
        }
        return;
      }

      // Handle null/undefined values
      if (oldValue === null || oldValue === undefined) {
        if (newValue !== null && newValue !== undefined) {
          changeParts.push(`${fieldLabel}: ${newValue}`);
        }
        return;
      }

      if (newValue === null || newValue === undefined) {
        if (oldValue !== null && oldValue !== undefined) {
          changeParts.push(
            `${fieldLabel}: <span style="opacity:0.5"><s>${oldValue}</s></span> → <em>dihapus</em>`
          );
        }
        return;
      }

      // Handle primitive values (string, number)
      if (oldValue !== newValue) {
        changeParts.push(
          `${fieldLabel}: <span style="opacity:0.5"><s>${oldValue}</s></span> → ${newValue}`
        );
      }

    });
    const itemName = new_data?.name || old_data?.name || "";
    const itemDisplay = itemName ? ` <strong>${itemName}</strong>` : "";
    // First line: who, action, item
    let message = `<strong>${userName}</strong> mengupdate${itemDisplay}:`;
    // Each change on a new line
    if (changeParts.length > 0) {
      message += "<br/>" + changeParts.join("<br/>");
    }
    return message;
  }

  return "";
}