"use client";
import React from "react";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface Props {
  isFullScreen?: boolean;
}

export default function Loading({ isFullScreen = true }: Props) {
  return (
    <div
      className={`flex items-center justify-center ${isFullScreen && "h-[80vh]"
        } `}
    >
      <Spin
      />
    </div>
  );
}
