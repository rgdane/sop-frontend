export type FormProps = {
  name: string;
  type:
  | "input"
  | "password"
  | "checkbox"
  | "select"
  | "multiselect"
  | "color"
  | "description"
  | "textarea"
  | "date"
  | "dateTime"
  | "dateRange"
  | "text"
  | "radio"
  | "treeSelect";
  rules?: any[];
  props?: any;
  options?: any[];
  valuePropName?: string;
  label?: string;
  editable?: boolean;
  renderView?: (value: any) => React.ReactNode;
  renderCustom?: (form: any) => React.ReactNode;
  resource?: any;
  width?: "full" | "half";
};
