import { SorterResult } from "antd/es/table/interface";

export const getSorterInfo = (
  sorter: SorterResult<any> | SorterResult<any>[]
) => {
  const mapOrder = (order?: string | null) => {
    if (order === "ascend") return "asc";
    if (order === "descend") return "desc";
    return undefined;
  };

  if (Array.isArray(sorter)) {
    return sorter.map((s) => ({
      column: s.columnKey,
      order: mapOrder(s.order),
    }));
  }
  return [
    {
      column: sorter.columnKey,
      order: mapOrder(sorter.order),
    },
  ];
};
