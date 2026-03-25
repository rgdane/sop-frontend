"use client";

import React from "react";
import { Space } from "antd";
import Button from "../Button";
import { PlusOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import Dropdown from "../Dropdown";
import { MenuItemWithPermission } from "@/types/props/dropdown.types";
import { Pagination } from "@/components/fragments/Pagination";

type FooterActionProps = {
  addButtonText?: string;
  onAddRow: () => void;
  onSave?: () => void; // Made optional as the button is removed
  selectedRowKeys: React.Key[];
  onBulkDelete: () => void;
  useBulkAction: boolean;
  useFooterAction?: boolean;
  useModal?: boolean;
  onPaginate?: any;
  dataSource?: any[];
};

export function FooterAction({
  addButtonText = "Tambah",
  onAddRow,
  selectedRowKeys,
  onBulkDelete,
  useBulkAction,
  useModal,
  onPaginate,
  dataSource,
  useFooterAction,
}: FooterActionProps) {
  const menuItems = [
    {
      key: "delete",
      danger: true,
      permission: "delete",
      label: (
        <Space>
          <DeleteOutlined />
          Hapus
        </Space>
      ),
    },
  ] as MenuItemWithPermission[];

  if (!useFooterAction && useModal) return null;

  return (
    <div className="flex justify-between w-full items-center pb-4">
      {useBulkAction && selectedRowKeys.length > 0 && (
        <div className="">
          <Dropdown
            trigger={["click"]}
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === "delete") {
                  onBulkDelete();
                }
              },
            }}
          >
            <Button icon={<MoreOutlined />}>Bulk Action</Button>
          </Dropdown>
        </div>
      )}
      {useFooterAction && (
        <Button
          permission="create"
          onClick={onAddRow}
          type="dashed"
          icon={<PlusOutlined />}
        >
          add
        </Button>
      )}
      {onPaginate && dataSource && (
        <Pagination onPaginate={onPaginate} datas={dataSource} />
      )}
    </div>
  );
}
