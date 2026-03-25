import { CommentOutlined } from "@ant-design/icons";
import { Drawer, Button, Tooltip } from "antd";
import React from "react";

interface DrawerButtonProps {
  title: string;
  Content: React.ReactNode;
  width?: string | number | undefined;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}

export default function DrawerButton({
  title,
  Content,
  width,
  open = false,
  onOpenChange = () => {},
}: DrawerButtonProps) {
  const handleClick = () => {
    onOpenChange(true);
  };

  const onClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Tooltip title="Aktivitas">
        <Button
          type="primary"
          shape="circle"
          icon={<CommentOutlined />}
          onClick={handleClick}
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1000,
            width: 48,
            height: 48,
          }}
        />
      </Tooltip>
      <Drawer
        title={title}
        placement="right"
        onClose={onClose}
        open={open}
        width={width}
      >
        {Content}
      </Drawer>
    </>
  );
}
