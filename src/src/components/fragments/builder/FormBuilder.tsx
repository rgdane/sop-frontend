import { usePermissions } from "@/components/providers/PermissionProvider";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { MODULES } from "@/constants/modules";
import { ModulePermissions, useAuthAction } from "@/features/auth/hook/useAuth";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { checkPermission } from "@/lib/checkPermission";
import { formatDateToIso } from "@/lib/formatDate";
import { FormProps } from "@/types/props/form.types";
import {
  CloseOutlined,
  EditOutlined,
  LoginOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Checkbox,
  ColorPicker,
  Divider,
  Form,
  FormInstance,
  Input,
  PopconfirmProps,
  Radio,
  Select,
  TreeSelect,
} from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import InputEditor from "../editor/InputEditor";

const { RangePicker } = DatePicker;

type FormBuilderProps = {
  form?: FormInstance<any>;
  record?: any;
  readonly?: boolean;
  fields: FormProps[];
  editMode?: boolean;
  className?: string;
  name?: string;
  onSubmit: (values: any) => void;
  onSubmitFailed?: (errorInfo: any) => void;
  useConfirm?: boolean;
  confirmProps?: PopconfirmProps;
  submitButtonText?: string;
  autoComplete?: "on" | "off";
  layout?: "row" | "column";
  permission?: "create" | "update";
  formName?: string;
  buttonProps?: {
    size?: "large" | "middle" | "small";
    width?: "fit" | "full";
    position?: "start" | "center" | "end";
    icon?: React.ReactNode;
    onClick?: () => void;
  };
};

const FormBuilder: React.FC<FormBuilderProps> = ({
  form: externalForm,
  record,
  readonly = false,
  fields,
  editMode = false,
  name,
  onSubmit,
  onSubmitFailed,
  submitButtonText = "Submit",
  autoComplete = "off",
  layout = "column",
  buttonProps,
  className,
  permission,
  useConfirm = false,
  confirmProps,
  formName = "dynamic-form",
}) => {
  const [isView, setIsView] = useState(editMode);
  const { getCurrentPermissions } = useAuthAction();
  const { modules } = usePermissions();

  const currentPermissions = useMemo(() => {
    if (!modules) return {};
    const perms = getCurrentPermissions(modules) as ModulePermissions;
    return perms ?? {};
  }, [modules]);

  const hasPermission = modules
    ? modules === MODULES._GENERAL
      ? true
      : checkPermission(currentPermissions, permission || "")
    : true;

  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  const initialValues = useMemo(() => {
    if (!record || Object.keys(record).length === 0) {
      return {};
    }

    const values: Record<string, any> = { ...record };

    fields.forEach((field) => {
      const key = field.name;

      if (field.type === "date" && record[key]) {
        values[key] = dayjs(record[key]);
      }

      if (field.type === "dateRange") {
        if (key === "date_range") {
          const startDate = record["start_date"];
          const endDate = record["end_date"];
          if (
            startDate &&
            endDate &&
            startDate !== "1070-01-01" &&
            endDate !== "1070-01-01"
          ) {
            values[key] = [dayjs(startDate), dayjs(endDate)];
          } else if (startDate && startDate !== "1070-01-01") {
            values[key] = [dayjs(startDate), null];
          } else if (endDate && endDate !== "1070-01-01") {
            values[key] = [null, dayjs(endDate)];
          } else {
            values[key] = null;
          }
        }
      }

      if (field.type === "multiselect" && Array.isArray(record[key])) {
        values[key] = (record[key] as any[])
          .map((item: any) => {
            if (typeof item === "object" && item) {
              return {
                label: item.label || item.name || item.id,
                value: item.id ?? item.value,
              };
            }
            return { label: item, value: item };
          })
          .filter(Boolean);
      }

      if (field.type === "radio" && record[key]) {
        values[key] = record[key];
      }

      // Handle select fields - ensure proper value extraction
      if (field.type === "select" && record[key]) {
        if (
          typeof record[key] === "object" &&
          record[key].value !== undefined
        ) {
          values[key] = record[key].value;
        } else {
          values[key] = record[key];
        }
      }
    });

    return values;
  }, []);

  // Set initial values when component mounts or record changes
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, []);

  // Transform form data before submitting
  const transformSubmitData = useCallback(
    (values: any) => {
      const transformedValues = { ...values };

      fields.forEach((field) => {
        const fieldValue = transformedValues[field.name];

        // Transform multiselect: [{ label, value }] -> [id, id, id]
        if (field.type === "multiselect" && Array.isArray(fieldValue)) {
          transformedValues[field.name] = fieldValue.map((item: any) =>
            typeof item === "object" ? item.value : item
          );
        }

        // Transform select: ensure only ID is sent for object values
        if (field.type === "select" && fieldValue) {
          if (
            typeof fieldValue === "object" &&
            fieldValue.value !== undefined
          ) {
            transformedValues[field.name] = fieldValue.value;
          }
          // If it's already a primitive value, keep as is
        }

        // Transform date fields
        if (field.type === "date" && fieldValue) {
          transformedValues[field.name] = formatDateToIso(fieldValue);
        }

        // Transform date range fields
        if (field.type === "dateRange" && Array.isArray(fieldValue)) {
          if (field.name === "date_range") {
            const [startDate, endDate] = fieldValue;
            transformedValues["start_date"] = startDate
              ? formatDateToIso(startDate)
              : null;
            transformedValues["end_date"] = endDate
              ? formatDateToIso(endDate)
              : null;
            // Remove the date_range field as it's split into start_date and end_date
            delete transformedValues[field.name];
          }
        }
      });

      return transformedValues;
    },
    [fields]
  );

  // renderViewField menerima array fields
  const renderViewField = (fields: FormProps[]) => {
    const regularItems = fields.filter((f) => f.type !== "description");
    const descriptionItem = fields.find((f) => f.type === "description");

    const renderItem = (field: FormProps, index: number) => {
      const value = record?.[field.name] ?? "";

      return (
        <div key={index} className="flex md:flex-row flex-col">
          <div className="flex items-center text-sm flex-shrink-0 md:w-[140px] w-full bg-gray-200 dark:bg-[#303030] border-b border-x border-black/10 dark:border-white/10">
            <div className="font-bold px-2 py-2">
              {capitalizeFirstLetter(field.label || "")}
            </div>
          </div>
          <div className="px-2 py-2 text-sm font-medium text-black/70 dark:text-white/70 text-left flex-1 border-b border-black/10 dark:border-white/10">
            {field.renderView ? field.renderView(value) : value ?? "-"}
          </div>
        </div>
      );
    };

    return (
      <div className="text-sm bg-white dark:bg-[#242424] px-8 py-4 border border-black/10 dark:border-white/10 rounded-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full border-t border-l border-black/10 dark:border-white/10">
          {regularItems.map(renderItem)}
        </div>

        {descriptionItem && (
          <>
            <Divider />
            <div className="w-full pb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TagOutlined className="text-base" />
                <span className="font-bold">
                  {capitalizeFirstLetter(descriptionItem.label || "")}
                </span>
              </div>
              {/* Tambahkan wrapper dengan overflow control */}
              <div className="w-full text-sm font-medium relative">
                {descriptionItem.renderView
                  ? descriptionItem.renderView(record?.[descriptionItem.name])
                  : record?.[descriptionItem.name] ?? "-"}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderField = useCallback(
    (field: FormProps) => {
      if (field.type === "input" || field.type === "text") {
        return (
          <Input
            disabled={field.editable === false}
            key={field.name}
            {...field.props}
          />
        );
      }

      if (field.type === "select") {
        return (
          <Select
            key={field.name}
            disabled={field.editable === false}
            placeholder={field.props?.placeholder}
            showSearch
            allowClear
            filterOption={(input, option) => {
              const text =
                option?.title ??
                (typeof option?.label === "string"
                  ? option.label
                  : React.isValidElement(option?.label)
                    ? (option.label.props as any)?.children
                    : "");

              return String(text)
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            options={(Array.isArray(field.options) ? field.options : []).map(
              (opt: any, idx: number) => ({
                key: opt.key || opt.value || `select-${field.name}-${idx}`,
                value: opt.value || idx,
                label: opt.label || String(opt.value || idx),
                title: opt.title || "",
              })
            )}
            style={{ width: "100%" }}
          />
        );
      }

      if (field.type === "multiselect") {
        return (
          <Select
            key={field.name}
            mode="multiple"
            showSearch
            allowClear
            labelInValue
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            disabled={field.editable === false}
            placeholder={field.props?.placeholder}
            style={{ width: "100%" }}
            options={field.options?.map((opt: any, idx: number) => ({
              key: opt.value || idx,
              value: opt.value,
              label: opt.label,
            }))}
          />
        );
      }

      if (field.type === "treeSelect") {
        return (
          <TreeSelect
            key={field.name}
            style={{ width: "100%" }}
            treeData={field.options || []}
            treeCheckable
            allowClear
            showSearch
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            placeholder={field.props?.placeholder || "Silakan pilih"}
            treeDefaultExpandAll
            filterTreeNode={(input, treeNode: any) =>
              (treeNode?.title ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            disabled={field.editable === false}
          />
        );
      }

      if (field.type === "password") {
        return (
          <Input.Password
            disabled={field.editable === false}
            key={field.name}
            {...field.props}
          />
        );
      }

      if (field.type === "textarea") {
        return (
          <Input.TextArea
            disabled={field.editable === false}
            key={field.name}
            {...field.props}
          />
        );
      }

      if (field.type === "color") {
        return (
          <ColorPicker
            key={field.name}
            format="hex"
            style={{ width: "100%" }}
            size="large"
          />
        );
      }

      if (field.type === "checkbox") {
        return <Checkbox key={field.name}>{field.label}</Checkbox>;
      }

if (field.type === "description") {
        return <InputEditor key={field.name} />;
      }

      if (field.type === "date") {
        return (
          <DatePicker
            onChange={(date: any) => formatDateToIso(date)}
            style={{ width: "100%" }}
          />
        );
      }

      if (field.type === "dateTime") {
        return (
          <DatePicker
            onChange={(date: any) => formatDateToIso(date)}
            showTime
            style={{ width: "100%" }}
          />
        );
      }

      if (field.type === "dateRange") {
        return (
          <RangePicker
            format="DD-MM-YYYY"
            style={{ width: "100%" }}
            placeholder={["Tanggal Mulai", "Tanggal Selesai"]}
          />
        );
      }

      if (field.type === "radio") {
        return (
          <Radio.Group
            key={field.name}
            disabled={field.editable === false}
            options={field.options}
          />
        );
      }

      if (field.type === "custom") {
        return field.renderCustom?.(form);
      }

      return null;
    },
    [isView]
  );

  const buttonClassName = useMemo(() => {
    return buttonProps?.width === "fit" ? "w-fit" : "w-full";
  }, [buttonProps?.width]);

  const containerClassName = useMemo(() => {
    return `flex gap-x-2 justify-${buttonProps?.position || "start"}`;
  }, [buttonProps?.position]);

  return (
    <Form
      name={name || `form-${Math.random().toString(36).substr(2, 9)}`}
      form={form}
      onFinish={(values) => {
        const transformedValues = transformSubmitData(values);
        onSubmit(transformedValues);
        editMode && setIsView(true);
      }}
      onFinishFailed={onSubmitFailed}
      autoComplete={autoComplete}
      layout="vertical"
      className={twMerge(className)}
    >
      {layout === "row" ? (
        <div
          className={`flex flex-wrap w-full ${isView ? "gap-4" : "gap-x-4"}`}
        >
          {!isView ? (
            fields.map((field) => {
              const fieldWidth =
                field.width === "full"
                  ? "w-full"
                  : field.width === "half"
                    ? "w-full sm:w-[calc(50%-0.5rem)]"
                    : "w-full sm:w-[calc(50%-0.5rem)]";

              return (
                <div key={field.name} className={fieldWidth}>
                  <Form.Item
                    key={field.name}
                    label={field.label}
                    rules={field.rules}
                    name={field.name}
                  >
                    {renderField(field)}
                  </Form.Item>
                </div>
              );
            })
          ) : (
            <div className="w-full">{renderViewField(fields)}</div>
          )}
        </div>
      ) : (
        fields.map((field: any) => (
          <Form.Item
            key={field.name}
            rules={field.rules}
            label={field.label}
            name={field.name}
          >
            {renderField(field)}
          </Form.Item>
        ))
      )}

      {hasPermission && (
        <div className="bottom-0 bg-transparent py-2">
          <div className={containerClassName}>
            {editMode && !readonly && (
              <Button
                icon={isView ? <EditOutlined /> : <CloseOutlined />}
                className={buttonClassName}
                size={buttonProps?.size || "large"}
                onClick={() => setIsView(!isView)}
                type="text"
                permission="update"
              >
                {isView ? "Edit" : "Cancel"}
              </Button>
            )}
            {editMode ? (
              isView ? null : (
                <Button
                  type="primary"
                  icon={buttonProps?.icon || <LoginOutlined />}
                  className={buttonClassName}
                  size={buttonProps?.size || "large"}
                  onClick={() => form.submit()}
                >
                  {submitButtonText}
                </Button>
              )
            ) : (
              <Button
                type="primary"
                icon={buttonProps?.icon || <LoginOutlined />}
                className={buttonClassName}
                size={buttonProps?.size || "large"}
                onClick={() => form.submit()}
              >
                {submitButtonText}
              </Button>
            )}
          </div>
        </div>
      )}
    </Form>
  );
};

export default React.memo(FormBuilder);
