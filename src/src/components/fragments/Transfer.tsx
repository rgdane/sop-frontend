import React, { useState, useMemo, Key } from "react";
import {
  Transfer as TransferAntd,
  TransferProps,
  Table,
  TableColumnsType,
} from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { DownOutlined, RightOutlined, SaveOutlined } from "@ant-design/icons";
import Button from "../ui/Button";

interface RecordType {
  key: string;
  title: string;
  isParent?: boolean;
  parentKey?: string;
  level?: number;
  sprint_id?: string | number; // Add sprint_id field
}

interface TransferableItem {
  id: string | number;
  name: string;
  sprint_id?: string | number; // Add sprint_id field
  [key: string]: any;
}

type Props<T extends TransferableItem> = TransferProps & {
  dataSource: T[];
  useChild?: string;
  titleSource?: string;
  titleTarget?: string;
  parentKeyField?: string;
  childKeyField?: string;
  childNameField?: string;
  onSave?: any;
  onChange?: TransferProps["onChange"];
  onSelectChange?: TransferProps["onSelectChange"];
  parentSelect?: boolean;
  operations?: string[];
};

export const convertToTransferResource = (
  data: any[],
  useChild?: string,
  parentKeyField = "id",
  childKeyField = "id",
  childNameField = "name"
) => {
  const result: RecordType[] = [];

  data.forEach((item) => {
    if (useChild && item[useChild] && Array.isArray(item[useChild])) {
      result.push({
        key: `parent_${item[parentKeyField].toString()}`,
        title: item.name,
        isParent: true,
        level: 0,
      });

      item[useChild].forEach((child: any) => {
        result.push({
          key: child[childKeyField].toString(),
          title: child[childNameField],
          isParent: false,
          parentKey: `parent_${item[parentKeyField].toString()}`,
          level: 1,
          sprint_id: child.sprint_id,
        });
      });
    } else {
      result.push({
        key: item[parentKeyField].toString(),
        title: item[childNameField],
        isParent: false,
        level: 0,
        sprint_id: item.sprint_id,
      });
    }
  });

  return result;
};

export const Transfer = <T extends TransferableItem>(props: Props<T>) => {
  const {
    dataSource,
    useChild,
    titleSource = "Resource",
    titleTarget = "Target",
    parentKeyField = "id",
    childKeyField = "id",
    childNameField = "name",
    onSave = () => {},
    onChange = () => {},
    onSelectChange = () => {},
    parentSelect = false,
    operations,
    ...rest
  } = props;

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [nextTargetKeys, setNextTargetKeys] = useState<Key[]>([]);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [moveKeys, setMoveKeys] = useState<Key[]>([]);

  if (!dataSource) {
    return null;
  }

  const allDataResource: RecordType[] = useMemo(
    () =>
      convertToTransferResource(
        dataSource,
        useChild,
        parentKeyField,
        childKeyField,
        childNameField
      ),
    [dataSource, useChild, parentKeyField, childKeyField, childNameField]
  );

  const resourceColumn: TableColumnsType<RecordType> = [
    {
      title: titleSource,
      dataIndex: "title",
      key: "title",
      render: (text: string, record: RecordType) => {
        const indent = (record.level || 0) * 20;
        const isExpanded = expandedKeys.includes(record.key);
        const hasSprintId = record.sprint_id; // Check if item has sprint_id

        return (
          <div
            style={{
              paddingLeft: indent,
              display: "flex",
              alignItems: "center",
            }}
          >
            {record.isParent && (
              <span
                style={{ marginRight: 8, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedKeys((prev) =>
                    prev.includes(record.key)
                      ? prev.filter((key) => key !== record.key)
                      : [...prev, record.key]
                  );
                }}
              >
                {isExpanded ? (
                  <DownOutlined style={{ fontSize: 10 }} />
                ) : (
                  <RightOutlined style={{ fontSize: 10 }} />
                )}
              </span>
            )}
            <span
              className={
                hasSprintId && !record.isParent
                  ? "line-through text-gray-400"
                  : ""
              }
              style={{
                fontWeight: record.isParent ? "bold" : "normal",
                color: hasSprintId && !record.isParent ? "#999" : undefined,
              }}
            >
              {text}
              {hasSprintId && !record.isParent && (
                <span
                  style={{ fontSize: "11px", marginLeft: "8px", color: "#999" }}
                >
                  (sudah ditransfer)
                </span>
              )}
            </span>
          </div>
        );
      },
    },
  ];

  const targetColumn: TableColumnsType<RecordType> = [
    {
      title: titleTarget,
      dataIndex: "title",
      key: "title",
      render: (text: string, record: RecordType) => {
        const indent = (record.level || 0) * 20;
        const isExpanded = expandedKeys.includes(record.key);
        return (
          <div
            style={{
              paddingLeft: indent,
              display: "flex",
              alignItems: "center",
            }}
          >
            {record.isParent && (
              <span
                style={{ marginRight: 8, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedKeys((prev) =>
                    prev.includes(record.key)
                      ? prev.filter((key) => key !== record.key)
                      : [...prev, record.key]
                  );
                }}
              >
                {isExpanded ? (
                  <DownOutlined style={{ fontSize: 10 }} />
                ) : (
                  <RightOutlined style={{ fontSize: 10 }} />
                )}
              </span>
            )}
            <span
              style={{
                fontWeight: record.isParent ? "bold" : "normal",
              }}
            >
              {text}
            </span>
          </div>
        );
      },
    },
  ];

  const getVisibleData = (data: RecordType[]) => {
    return data.filter((item) => {
      if (item.isParent) return true;
      if (!item.parentKey) return true;
      if (item.parentKey && expandedKeys.includes(item.parentKey)) return true;
      return false;
    });
  };

  const getFilteredDataWithParents = (
    filteredItems: RecordType[],
    allData: RecordType[]
  ) => {
    const filteredKeys = filteredItems.map((item) => item.key);
    const result = new Set<string>();

    // Tambahkan semua item yang match dengan filter
    filteredKeys.forEach((key) => result.add(key));

    // Tambahkan parent dari child yang match
    allData.forEach((item) => {
      if (!item.isParent && item.parentKey && filteredKeys.includes(item.key)) {
        result.add(item.parentKey);
      }
    });

    // Tambahkan child dari parent yang match (opsional)
    allData.forEach((item) => {
      if (item.isParent && filteredKeys.includes(item.key)) {
        allData.forEach((childItem) => {
          if (childItem.parentKey === item.key) {
            result.add(childItem.key);
          }
        });
      }
    });

    return allData.filter((item) => result.has(item.key));
  };

  const handleRowClick = (
    record: RecordType,
    onItemSelect: any,
    listSelectedKeys: any
  ) => {
    if (record.isParent) {
      setExpandedKeys((prev) =>
        prev.includes(record.key)
          ? prev.filter((key) => key !== record.key)
          : [...prev, record.key]
      );
    } else {
      // Don't allow selection if item has sprint_id
      if (record.sprint_id) return;

      const isSelected = listSelectedKeys.includes(record.key);
      onItemSelect(record.key, !isSelected);
    }
  };

  const handleChange: TransferProps["onChange"] = (
    nextTargetKeys,
    direction,
    moveKeys
  ) => {
    onChange(nextTargetKeys, direction, moveKeys);
    setNextTargetKeys(nextTargetKeys);
    setDirection(direction);
    setMoveKeys(moveKeys);
  };

  const handleSave = () => {
    onSave(nextTargetKeys, direction, moveKeys);
  };

  return (
    <div>
      <div className="pb-4 flex justify-end">
        <Button
          icon={<SaveOutlined />}
          disabled={moveKeys.length === 0}
          type="primary"
          onClick={handleSave}
        >
          Simpan
        </Button>
      </div>
      <TransferAntd
        showSearch
        filterOption={(filterValue, item) =>
          item.title.toLowerCase().includes(filterValue.toLowerCase())
        }
        showSelectAll={false}
        style={{ width: "100%" }}
        dataSource={allDataResource}
        render={(item) => item.title}
        operations={operations}
        onChange={handleChange}
        onSelectChange={onSelectChange}
        {...rest}
      >
        {({
          direction,
          filteredItems,
          onItemSelect,
          onItemSelectAll,
          selectedKeys: listSelectedKeys,
          disabled: listDisabled,
        }) => {
          const columns = direction === "left" ? resourceColumn : targetColumn;

          const transferredKeys =
            direction === "left" ? rest.targetKeys || [] : [];

          let displayData;
          if (direction === "left") {
            const filteredData = getFilteredDataWithParents(
              filteredItems,
              allDataResource
            );
            displayData = getVisibleData(filteredData);
          } else {
            const transferredItems = filteredItems;
            const transferredKeys = transferredItems.map((item) => item.key);

            const parentsWithTransferredChildren = new Set<string>();
            allDataResource.forEach((item) => {
              if (
                !item.isParent &&
                item.parentKey &&
                transferredKeys.includes(item.key)
              ) {
                parentsWithTransferredChildren.add(item.parentKey);
              }
            });

            const targetData = allDataResource.filter((item) => {
              if (item.isParent) {
                return parentsWithTransferredChildren.has(item.key);
              }
              return transferredKeys.includes(item.key);
            });

            displayData = getVisibleData(targetData);
          }

          const dynamicColumns =
            direction === "left"
              ? [
                  {
                    ...resourceColumn[0],
                    render: (text: string, record: RecordType) => {
                      const indent = (record.level || 0) * 20;
                      const isExpanded = expandedKeys.includes(record.key);
                      const isTransferred = transferredKeys.includes(
                        record.key
                      );
                      const hasSprintId = record.sprint_id; // Check if item has sprint_id

                      return (
                        <div
                          style={{
                            paddingLeft: indent,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {record.isParent && (
                            <span
                              style={{ marginRight: 8, cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedKeys((prev) =>
                                  prev.includes(record.key)
                                    ? prev.filter((key) => key !== record.key)
                                    : [...prev, record.key]
                                );
                              }}
                            >
                              {isExpanded ? (
                                <DownOutlined style={{ fontSize: 10 }} />
                              ) : (
                                <RightOutlined style={{ fontSize: 10 }} />
                              )}
                            </span>
                          )}
                          <span
                            className={
                              (isTransferred && !record.isParent) || hasSprintId
                                ? "line-through text-gray-400"
                                : ""
                            }
                            style={{
                              fontWeight: record.isParent ? "bold" : "normal",
                              color: hasSprintId ? "#999" : undefined, // Make text gray if has sprint_id
                            }}
                          >
                            {text}
                            {hasSprintId && !record.isParent && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  marginLeft: "8px",
                                  color: "#999",
                                }}
                              >
                                (sudah ditransfer)
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    },
                  },
                ]
              : targetColumn;

          const rowSelection: TableRowSelection<RecordType> = {
            getCheckboxProps: (record) => {
              const isTransferred = transferredKeys.includes(record.key);
              const hasSprintId = Boolean(record.sprint_id);

              // Different logic for source vs target
              if (!parentSelect) {
                if (direction === "left") {
                  // Source column: disable if has sprint_id or is already transferred
                  return {
                    disabled:
                      Boolean(listDisabled) ||
                      record.isParent ||
                      isTransferred ||
                      hasSprintId,
                    style:
                      record.isParent || isTransferred || hasSprintId
                        ? { visibility: "hidden" }
                        : {},
                  };
                } else {
                  // Target column: only disable parents, allow selection of transferred items
                  return {
                    disabled: Boolean(listDisabled) || record.isParent,
                    style: record.isParent ? { visibility: "hidden" } : {},
                  };
                }
              } else {
                if (direction === "left") {
                  return {
                    disabled:
                      Boolean(listDisabled) || isTransferred || hasSprintId,
                    style:
                      isTransferred || hasSprintId
                        ? { visibility: "hidden" }
                        : {},
                  };
                } else {
                  return {
                    disabled: Boolean(listDisabled),
                    style: {},
                  };
                }
              }
            },
            onChange(selectedRowKeys: any) {
              if (direction === "left") {
                let childKeys = selectedRowKeys.filter((key: string) => {
                  const item = allDataResource.find((item) => item.key === key);
                  return (
                    item && !transferredKeys.includes(key) && !item.sprint_id
                  );
                });
                for (let i = 0; i < childKeys.length; i++) {
                  const item = allDataResource.find(
                    (r) => r.key === childKeys[i]
                  );
                  if (item?.isParent) {
                    const children = allDataResource
                      .filter(
                        (c) =>
                          c.parentKey === item.key &&
                          !c.sprint_id &&
                          !transferredKeys.includes(c.key)
                      )
                      .map((c) => c.key);
                    if (childKeys.includes(item.key)) {
                      childKeys.push(...children);
                    } else {
                      childKeys = childKeys.filter(
                        (key: any) => !children.includes(key)
                      );
                    }
                  }
                }
                onItemSelectAll(childKeys, "replace");
              } else {
                // Target column: allow selection of all non-parent items
                let childKeys = selectedRowKeys.filter((key: string) => {
                  const item = allDataResource.find((item) => item.key === key);
                  return item;
                });
                for (let i = 0; i < childKeys.length; i++) {
                  const item = allDataResource.find(
                    (r) => r.key === childKeys[i]
                  );
                  if (item?.isParent) {
                    const children = allDataResource
                      .filter(
                        (c) =>
                          c.parentKey === item.key &&
                          rest.targetKeys?.includes(c.key)
                      )
                      .map((c) => c.key);

                    if (childKeys.includes(item.key)) {
                      childKeys.push(...children);
                    } else {
                      childKeys = childKeys.filter(
                        (key: any) => !children.includes(key)
                      );
                    }
                  }
                }
                onItemSelectAll(childKeys, "replace");
              }
            },
            selectedRowKeys: listSelectedKeys.filter((key) => {
              const item = allDataResource.find((item) => item.key === key);
              if (direction === "left") {
                return (
                  item && !transferredKeys.includes(key) && !item.sprint_id
                );
              } else {
                // Target column: show all selected non-parent items
                return item;
              }
            }),
            hideSelectAll: true,
          };

          return (
            <div className="pt-4 pb-8 max-h-[50vh] overflow-auto">
              <Table
                rowSelection={rowSelection}
                columns={dynamicColumns}
                dataSource={displayData}
                size="small"
                pagination={false}
                showHeader={true}
                style={{
                  pointerEvents: listDisabled ? "none" : undefined,
                }}
                onRow={(record) => ({
                  onClick: () => {
                    if (listDisabled) return;

                    if (direction === "left" && record.sprint_id) return;

                    if (record.isParent) {
                      setExpandedKeys((prev) =>
                        prev.includes(record.key)
                          ? prev.filter((key) => key !== record.key)
                          : [...prev, record.key]
                      );
                    } else {
                      if (direction === "left" && record.sprint_id) return;

                      const isSelected = listSelectedKeys.includes(record.key);
                      onItemSelect(record.key, !isSelected);
                    }
                  },
                  style: {
                    cursor: record.isParent
                      ? "pointer"
                      : direction === "left" && record.sprint_id
                      ? "not-allowed"
                      : "default",
                  },
                })}
              />
            </div>
          );
        }}
      </TransferAntd>
    </div>
  );
};
