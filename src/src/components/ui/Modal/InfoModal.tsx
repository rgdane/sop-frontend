"use client";
import React, { useMemo, useState } from "react";
import { Modal } from "antd";
import { CompressOutlined, ExpandOutlined } from "@ant-design/icons";
import Button from "../Button";
import { BaseRecord } from "@/types/props/table.types";
import { CustomColumnProps } from "@/types/props/column.types";

interface InfoModalProps<T extends BaseRecord> {
  open: boolean;
  onClose: () => void;
  record: T | null;
  columns: CustomColumnProps<T>[];
  visibleColumns?: (keyof T & string)[];
  entityName?: string;
  disableCopy?: boolean;
}

export function InfoModal<T extends BaseRecord>({
  open,
  onClose,
  record,
  columns,
  visibleColumns,
  entityName = "Data",
  disableCopy = false,
}: InfoModalProps<T>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Decide which columns to show
  const displayColumns = useMemo(() => {
    if (!visibleColumns) return columns;
    return columns.filter(
      (col) =>
        col.dataIndex &&
        visibleColumns.includes(col.dataIndex as keyof T & string)
    );
  }, [columns, visibleColumns]);

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      closable={false}
      maskClosable={false}
      onCancel={handleClose}
      afterClose={() => setIsFullscreen(false)}
      footer={null}
      title={
        <div className="flex justify-between items-center">
          <span>Informasi {entityName !== "Data" ? entityName : ""}</span>
          <Button
            type="text"
            icon={!isFullscreen ? <ExpandOutlined /> : <CompressOutlined />}
            onClick={() => setIsFullscreen((prev) => !prev)}
          />
        </div>
      }
      styles={{
        content: isFullscreen
          ? {
              padding: 50,
              width: "100vw",
              maxWidth: "100vw",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 0,
            }
          : {
              padding: 24,
              maxWidth: "100vw",
              width: "100%",
              borderRadius: 8,
            },
        body: {
          flex: 1,
          overflowY: "auto",
          padding: 24,
        },
      }}
      style={isFullscreen ? { top: 0, left: 0, margin: 0, padding: 0 } : {}}
    >
      {open && record && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayColumns.map((col) => {
              if (!col.dataIndex) return null;

              const key = col.dataIndex as keyof T & string;
              const label = col.title;
              let value: any = record[key] ?? "-";

              if (key.endsWith("_id") && value !== "-") {
                const relatedKey = key.slice(0, -3);
                let relatedObj = (record as any)[relatedKey];
                if (!relatedObj) {
                  if ((record as any)[`${relatedKey}s`]) {
                    relatedObj = (record as any)[`${relatedKey}s`];
                  } else if ((record as any)[`has_${relatedKey}`]) {
                    relatedObj = (record as any)[`has_${relatedKey}`];
                  } else if ((record as any)[`has_${relatedKey}s`]) {
                    relatedObj = (record as any)[`has_${relatedKey}s`];
                  }
                }
                if (relatedObj && typeof relatedObj === "object") {
                  if ("name" in relatedObj) {
                    value = relatedObj.name;
                  } else if ("title" in relatedObj) {
                    value = relatedObj.title;
                  }
                }
              }

              return (
                <div key={key} className="flex flex-col">
                  {String(value) !== "" && (
                    <span className="text-gray-500 text-sm">{label}</span>
                  )}
                  <span className="text-base">{String(value)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            {!disableCopy && (
              <Button
                onClick={() => {
                  if (!record) return;
                  const textToCopy = displayColumns
                    .map((col) => {
                      if (!col.dataIndex) return "";
                      const key = col.dataIndex as keyof T & string;
                      let value: any = record[key];

                      if (key.endsWith("_id")) {
                        const relatedKey = key.slice(0, -3);
                        let relatedObj = (record as any)[relatedKey];
                        if (!relatedObj) {
                          if ((record as any)[`${relatedKey}s`]) {
                            relatedObj = (record as any)[`${relatedKey}s`];
                          } else if ((record as any)[`has_${relatedKey}`]) {
                            relatedObj = (record as any)[`has_${relatedKey}`];
                          } else if ((record as any)[`has_${relatedKey}s`]) {
                            relatedObj = (record as any)[`has_${relatedKey}s`];
                          }
                        }
                        if (relatedObj && typeof relatedObj === "object") {
                          if ("name" in relatedObj) {
                            value = relatedObj.name;
                          } else if ("title" in relatedObj) {
                            value = relatedObj.title;
                          }
                        }
                      }
                      return `${col.title}: ${value ?? "-"}`;
                    })
                    .filter(Boolean)
                    .join("\n");
                  navigator.clipboard.writeText(textToCopy);
                }}
                type="primary"
              >
                Copy Informasi {entityName}
              </Button>
            )}
            <Button onClick={handleClose}>Tutup</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
