import { formatColumns } from "@/lib/formatColumns";
import { BaseRecord, EditableRecord } from "@/types/props/table.types";

export function useTableActions<T extends BaseRecord>(
  columns: any[],
  onCreate: (data: Omit<T, "id">) => Promise<void>,
  onUpdate: (id: number, data: Partial<T>) => Promise<void>,
  onDelete: (id: number, isPermanent?: boolean) => Promise<void>,
  onBulkCreate?: (data: Omit<T, "id">[]) => Promise<void>
) {
  const handleRowSave = async (
    record: EditableRecord & T,
    silent = false
  ): Promise<boolean> => {
    try {
      const { isNew, tempId, id, ...rawData } = record;
      const formattedData = await formatColumns<T>(
        rawData as Partial<T>,
        columns
      );

      if (isNew) {
        if (!onBulkCreate || typeof onBulkCreate !== "function") {
          await onCreate(formattedData as Omit<T, "id">);
          return true;
        } else {
          console.warn("New record should be saved via bulk create");
          return false;
        }
      } else {
        await onUpdate(record.id, formattedData as Partial<T>);
        return true;
      }
    } catch (error) {
      console.error("Save error:", error);
      return false;
    }
  };

  const handleDelete = async (
    record: EditableRecord & T,
    setDataSource: React.Dispatch<
      React.SetStateAction<Array<EditableRecord & T>>
    >,
    setEditingIds: React.Dispatch<React.SetStateAction<number[]>>,
    isPermanent = false
  ) => {
    try {
      if (record.isNew) {
        setDataSource((prev) =>
          prev.filter((item) => item.tempId !== record.tempId)
        );
        setEditingIds((prev) => prev.filter((id) => id !== record.tempId));
      } else {
        await onDelete(record.id, isPermanent);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const validateRecords = (
    records: Array<EditableRecord & T>
  ): Record<number, string[]> => {
    const validationErrors: Record<number, string[]> = {};

    records.forEach((record) => {
      const errors: string[] = [];
      columns.forEach((col) => {
        const rules = col.rules || [];
        const value = record[col.key as keyof T];
        const requiredRule = rules.find((r: any) => r.required);
        if (
          requiredRule &&
          (value === "" || value === undefined || value === null)
        ) {
          errors.push(col.key);
        }
      });
      if (errors.length > 0) {
        validationErrors[record.tempId] = errors;
      }
    });

    return validationErrors;
  };

  const handleBulkCreateNewRows = async (
    dataSource: Array<EditableRecord & T>,
    setEditingIds: React.Dispatch<React.SetStateAction<number[]>>,
    setDataSource: React.Dispatch<
      React.SetStateAction<Array<EditableRecord & T>>
    >,
    setValidationErrors: React.Dispatch<
      React.SetStateAction<Record<number, string[]>>
    >
  ): Promise<boolean> => {
    try {
      const newRecords = dataSource.filter((record) => record.isNew);
      if (newRecords.length === 0) return true;

      const newValidationErrors = validateRecords(newRecords);

      if (Object.keys(newValidationErrors).length > 0) {
        setValidationErrors(newValidationErrors);
        return false;
      }

      const formattedRecords = await Promise.all(
        newRecords.map(async (record) => {
          const { isNew, tempId, id, ...rawData } = record;
          return await formatColumns<T>(rawData as Partial<T>, columns);
        })
      );

      if (onBulkCreate && typeof onBulkCreate === "function") {
        await onBulkCreate(formattedRecords as Omit<T, "id">[]);
      } else {
        for (const formattedData of formattedRecords) {
          await onCreate(formattedData as Omit<T, "id">);
        }
      }

      const newRecordTempIds = newRecords.map((r) => r.tempId);
      setEditingIds((prev) =>
        prev.filter((id) => !newRecordTempIds.includes(id))
      );
      setDataSource((prev) => prev.filter((r) => !r.isNew));
      setValidationErrors({});

      return true;
    } catch (error) {
      console.error("Create error:", error);
      return false;
    }
  };

  return {
    handleRowSave,
    handleDelete,
    handleBulkCreateNewRows,
    validateRecords,
  };
}
