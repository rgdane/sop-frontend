import { ReactNode } from "react";

export interface MenuItemTypes {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  type?: "group" | "divider";
  module?: string;
  children?: MenuItemTypes[];
}
