"use client";

import { Select as SelectAntd, SelectProps } from "antd";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { CloseOutlined } from "@ant-design/icons";

interface CustomSelectProps extends SelectProps {
  mobileOptimized?: boolean;
  mobileMaxTagCount?: number;
}

function Select(props: CustomSelectProps) {
  const {
    mobileOptimized = true,
    mobileMaxTagCount = 1,
    mode,
    maxTagCount,
    maxTagPlaceholder,
    tagRender,
    className = "",
    style,
    ...restProps
  } = props;

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  const mobileOptimizedProps =
    mobileOptimized && mode === "multiple"
      ? {
          maxTagCount: isMobile ? mobileMaxTagCount : maxTagCount,
          maxTagPlaceholder:
            maxTagPlaceholder ||
            ((omittedValues: any[]) => `+${omittedValues.length} lainnya`),
          tagRender:
            tagRender ||
            ((tagProps: any) => {
              const { label, closable, onClose } = tagProps;
              return (
                <div
                  className="bg-gray-100 dark:bg-[#444444] border border-gray-300 dark:border-white/50"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    margin: "2px",
                    padding: "2px 6px",
                    fontSize: isMobile ? "11px" : "12px",
                    lineHeight: 1.2,
                    borderRadius: "4px",
                    maxWidth: isMobile ? "120px" : "150px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {label}
                  </span>
                  {closable && (
                    <span
                      onClick={onClose}
                      style={{
                        marginLeft: "4px",
                        cursor: "pointer",
                        fontSize: "10px",
                        flexShrink: 0,
                        color: "var(--ant-color-text-secondary)",
                      }}
                    >
                      <CloseOutlined />
                    </span>
                  )}
                </div>
              );
            }),
        }
      : {};

  return (
    <SelectAntd
      {...restProps}
      {...mobileOptimizedProps}
      mode={mode}
      className={`${className} ${
        mobileOptimized && mode === "multiple" ? "mobile-optimized-select" : ""
      }`}
      style={{ width: "100%", ...style }}
    />
  );
}

Select.Option = SelectAntd.Option;

export default Select;
