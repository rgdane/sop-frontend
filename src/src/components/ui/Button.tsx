"use client";

import { ButtonProps } from "@/types/props/button.types";
import "@ant-design/v5-patch-for-react-19";
import { Button as ButtonAntd } from "antd";

type Props = ButtonProps & {
  redirectModule?: string;
};

export default function Button(props: Props) {
  const { ...rest } = props;
  return <ButtonAntd {...rest} />;
}