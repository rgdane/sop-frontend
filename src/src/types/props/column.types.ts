import { FilterDropdownProps } from "antd/es/table/interface";
import { BaseRecord, EditableRecord } from "./table.types";
import { ReactNode } from "react";
import { Rule } from "antd/es/form";
import { InputTypeProps } from "./input.type";
import { ColumnProps } from "antd/es/table";

export type CustomColumnProps<T extends BaseRecord> = ColumnProps & {
  key: string;
  defaultValue?: any;
  inputWidth?: string;
  title: string | ReactNode;
  dataIndex?: string;
  onChange?: (value: any, form?: any) => void | Promise<void>;
  onSearch?: (value: string) => void;
  editable?: boolean;
  inputType?: InputTypeProps;
  placeholder?: string;
  getDynamicTitle?: (record: T & EditableRecord) => string;
  options?: Array<{ label: string; title?: string; value: any; children?: any; selectable?: boolean }>;
  getDynamicTitles?: (record: T & EditableRecord) => string;
  getDynamicOptions?: (
    record: T & EditableRecord
  ) => Array<{ label: string; value: any }>;
  onFieldChange?: (
    field: string,
    value: any,
    record: T & EditableRecord
  ) => void;
  renderCell?: (value: any, record: T) => React.ReactNode;
  renderInput?: (value: any, record: T, form?: any) => React.ReactNode;
  renderDataView?: boolean;
  showInCreateOnly?: boolean;
  rules?: Rules[];
  responsive?: any[];
  ellipsis?: boolean;
  width?: number;
  filterSearch?: boolean;
  filterDropdown?: (props: FilterDropdownProps) => ReactNode;
  filters?: { text: string; value: string }[];
  filterMultiple?: boolean;
  onFilter?: (
    value: string | number | boolean | React.Key,
    record: T & EditableRecord // Allow intersection types
  ) => boolean;
  addDataOption?: any;
  dynamicOptions?: Record<string, { label: string; value: any }[]>;
  dependencies?: string[];
  disabled?: any;
  sorter?: any;
  disableEditing?: boolean;
  useBulkAction?: boolean;
};

type Rules = Rule & {
  // INFO: Isi ini jika perlu rules khusus atau tambahan lain
  required?: boolean;
  message?: string;
};
