import { useState, useEffect } from "react";
import { BaseRecord, EditableRecord } from "@/types/props/table.types";

export function useTableData<T extends BaseRecord>(datas: T[], title: string) {
  const [dataSource, setDataSource] = useState<Array<EditableRecord & T>>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [tempCounter, setTempCounter] = useState(1);

  useEffect(() => {
    const mapped = datas.map((item, index) => ({
      ...item,
      tempId: item.id || index + 1,
    }));
    setDataSource(mapped);
    setOriginalData(mapped);
    setTempCounter(Math.max(...datas.map((d) => d.id || 0), 0) + 1);
  }, [datas, title]);

  return {
    dataSource,
    setDataSource,
    originalData,
    setOriginalData,
    tempCounter,
    setTempCounter,
  };
}
