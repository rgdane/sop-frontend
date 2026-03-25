import { ButtonProps as ButtonPropsAntd } from "antd";
import { ActionPermissions } from "./action_permission.types";

export type ButtonProps = ButtonPropsAntd & {
  permission?: ActionPermissions;
};
