import { Input, Space, Select, Radio, Checkbox } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { FilterFilled, SearchOutlined } from "@ant-design/icons";
import React from "react";
import type { Key } from "react";
import Button from "../Button";

interface SearchProps<T> {
  filterDropdown: (props: FilterDropdownProps) => React.ReactNode;
  filterSearch: boolean;
  filterOptions?: { label: string; value: number }[];
  filterIcon?: (filtered: boolean) => React.ReactNode;
}

interface SearchOptions<T> {
  onSearch?: (
    value: string | number | boolean | React.Key | React.Key[],
    record: T
  ) => boolean;
  onReset?: () => void;
  filterOptions?: { label: string; value: string }[];
  /** select mode */
  mode?: "input" | "select" | "options" | "checkbox";
  /** options untuk select/radio */
  selectOptions?: { label: string; value: number }[];
  defaultFilterValue?: any;
}

export default function ColumnSearch<T extends object>(
  placeholder?: string,
  options?: SearchOptions<T>
): SearchProps<T> {
  const {
    onSearch,
    onReset,
    mode = "input",
    selectOptions = [],
  } = options || {};

  const renderMode = (
    mode: "input" | "select" | "options" | "checkbox",
    selectedKeys: Key[],
    setSelectedKeys: (keys: Key[]) => void,
    confirm: () => void,
    selectOptions: { label: string; value: number }[]
  ) => {
    switch (mode) {
      case "input":
        return (
          <Input
            placeholder={placeholder || "Search..."}
            value={selectedKeys[0] as string}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => {
              confirm();
              onSearch?.(selectedKeys[0], {} as T);
            }}
            style={{ width: 188 }}
            allowClear
          />
        );
      case "select":
        return (
          <Select
            placeholder={placeholder || "Pilih..."}
            style={{ width: 188 }}
            value={selectedKeys[0] as string}
            onChange={(val) => {
              setSelectedKeys(val ? [val] : []);
              confirm();
              onSearch?.(val, {} as T);
            }}
            allowClear
            options={selectOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        );
      case "options":
        return (
          <div style={{ minWidth: 'fit-content' }}>
            <Radio.Group
              value={selectedKeys[0]} // controlled
              onChange={(e) => {
                setSelectedKeys([e.target.value]);
                confirm();
                onSearch?.(e.target.value, {} as T);
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectOptions.map((option) => (
                  <div
                    key={option.value}
                    className="hover:bg-red-50 dark:hover:bg-[#4A4A4A] p-2 rounded-xl"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Radio value={option.value}>
                      {option.label}
                    </Radio>
                  </div>
                ))}
              </div>
            </Radio.Group>
          </div>
        );
      case "checkbox":
        return (
          <div style={{ minWidth: 'fit-content' }}>
            <Checkbox.Group
              value={selectedKeys as Key[]}
              onChange={(checkedValues) => {
                setSelectedKeys(checkedValues);
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectOptions.map((option) => (
                  <div
                    key={option.value}
                    className="hover:bg-red-50 dark:hover:bg-[#4A4A4A] p-2 rounded-xl"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Checkbox value={option.value}>
                      {option.label}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </div>
        );

      default:
        return null;
    }
  };

  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: FilterDropdownProps) => {
      if (
        selectedKeys.length === 0 &&
        options?.defaultFilterValue !== undefined
      ) {
        setTimeout(() => {
          const defaultValue = Array.isArray(options.defaultFilterValue)
            ? options.defaultFilterValue
            : [options.defaultFilterValue];
          setSelectedKeys(defaultValue);
          confirm({ closeDropdown: false });
        }, 0);
      }

      return (
        <div style={{ padding: 8 }}>
          <Space direction="vertical">
            <div className="w-full">
              {renderMode(
                mode,
                selectedKeys,
                setSelectedKeys,
                confirm,
                selectOptions
              )}
            </div>

            <Space>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  onSearch?.(mode === "checkbox" ? selectedKeys : selectedKeys[0], {} as T);
                }}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Cari
              </Button>
              <Button
                onClick={() => {
                  setSelectedKeys([]);
                  clearFilters?.();
                  confirm();
                  onReset?.();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </Space>
          </Space>
        </div>
      );
    },
    filterSearch: true,
    filterIcon(filtered) {
      return (
        <FilterFilled style={{ color: filtered ? "#db5b4d" : undefined }} />
      );
    },
  };
}
