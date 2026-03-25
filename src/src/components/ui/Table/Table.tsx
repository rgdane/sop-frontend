import { Table as TableAntd, TableProps } from "antd";
import { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";

export default function Table<T extends object = any>(props: TableProps<T>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <TableAntd<T> {...props} />;
}
