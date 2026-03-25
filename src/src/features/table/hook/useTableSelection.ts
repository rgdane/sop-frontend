import { useState, useMemo } from "react";
import { BaseRecord, EditableRecord } from "@/types/props/table.types";

export function useTableSelection<T extends BaseRecord>(
  dataSource: Array<EditableRecord & T>,
  hideActions?: (record: T) => { hideEdit?: boolean; hideDelete?: boolean }
) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (newKeys: React.Key[]) => {
        const allowedKeys = dataSource
          .filter((record) => {
            if (hideActions) {
              const visibility = hideActions(record);
              return !(visibility?.hideDelete && visibility?.hideEdit);
            }
            return true;
          })
          .map((r) => r.tempId);

        const filteredKeys = newKeys.filter((key) =>
          allowedKeys.includes(key as number)
        );
        setSelectedRowKeys(filteredKeys);
      },
      getCheckboxProps: (record: EditableRecord & T) => {
        const visibility = hideActions ? hideActions(record) : {};
        return {
          disabled: visibility?.hideDelete && visibility?.hideEdit,
        };
      },
    }),
    [selectedRowKeys, dataSource, hideActions]
  );

  const getSelectedRecords = (): T[] => {
    return selectedRowKeys
      .map((key) => dataSource.find((r) => r.tempId === key))
      .filter((record): record is EditableRecord & T => record !== undefined)
      .map((record) => {
        const { tempId, isNew, ...rest } = record;
        return rest as T;
      });
  };

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    rowSelection,
    getSelectedRecords,
  };
}
