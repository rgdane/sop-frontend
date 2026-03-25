import { Col, Collapse, CollapseProps } from "antd";
import { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

export type WrapperProps = {
  children: React.ReactNode;
  title: any;
  childClass?: string;
  description?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  collapsible?: boolean;
  defaultActive?: boolean;
} & Omit<HTMLProps<HTMLDivElement>, "title">;

export const Wrapper = (props: WrapperProps) => {
  const {
    children,
    icon,
    title = "Detail",
    description,
    extra,
    childClass,
    collapsible = false,
    defaultActive = true,
    ...rest
  } = props;

  const header = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-x-4 px-4">
        {icon && (
          <div className="border border-primary/10 bg-primary/10 text-primary rounded-[20%] w-[45px] h-[45px] flex items-center justify-center text-lg">
            {icon}
          </div>
        )}
        <div>
          <div className="text-lg font-bold">{title}</div>
          {description && <div className="text-sm">{description}</div>}
        </div>
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );

  if (collapsible) {
    const items: CollapseProps["items"] = [
      {
        key: "1",
        label: header,
        children: <div className="sm:px-4 py-2 w-full">{children}</div>,
        className: "w-full",
      },
    ];
    return (
      <Collapse
        defaultActiveKey={defaultActive ? ["1"] : []}
        className={twMerge(
          "rounded-xl !border !border-black/10 dark:!border-white/10 bg-white dark:bg-[#242424] w-full",
          rest.className
        )}
        items={items}
      />
    );
  }

  return (
    <div
      className={twMerge(
        "rounded-xl bg-white dark:bg-[#242424] w-full transition-all duration-300 group border border-black/10 dark:border-white/10 ",
        rest.className
      )}
    >
      <div className="rounded-t-xl px-4 py-4 border-b border-black/10 dark:border-white/10">
        {header}
      </div>
      <div
        className={twMerge("px-2 sm:px-8 py-4 w-full min-h-max", childClass)}
      >
        {children}
      </div>
    </div>
  );
};
