import { BaseRecord } from "./table.types";
import type { CustomColumnProps } from "./column.types";
export interface EditModalProps<T extends BaseRecord> {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<T>) => void;
  record: T;
  columns: any[];
}

export interface CreateModalProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<T, "id">) => Promise<void> | void;
  columns: any[];
  defaultValues?: Partial<T>;
}

export interface ImportModalProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: string) => Promise<void> | void;
  templateHeaders?: string[];
  templateFileName?: string;
}
