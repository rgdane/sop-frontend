import { Divider } from "antd";
import React from "react";
import { twMerge } from "tailwind-merge";

export interface DetailItem {
  key: string;
  name: string;
  label: string;
  value?: any;
  icon?: React.ReactNode;
  hidden?: boolean;
  isDescription?: boolean;
  renderView?: (value: any) => React.ReactNode;
}

interface DetailBuilderProps {
  title?: string;
  items: DetailItem[];
  bordered?: boolean;
  className?: string;
}

const DetailBuilder: React.FC<DetailBuilderProps> = ({
  title,
  items,
  className,
}) => {
  const regularItems = items.filter((item) => item.key !== "description" && !item.isDescription);
  const descriptionItems = items.filter((item) => item.key === "description" || item.isDescription);

  const renderItem = (item: DetailItem, index: number) => (
    (item.hidden) ? null : (<div key={index} className="flex md:flex-row flex-col">
      <div className="flex items-center text-sm flex-shrink-0 md:w-[140px] w-full bg-gray-200 dark:bg-[#303030] border-b border-x border-black/10 dark:border-white/10">
        <div className="font-bold px-2 py-2">{item.label}</div>
      </div>
      <div className=" px-2 py-2 text-sm font-medium text-black/70 dark:text-white/70 text-left flex-2 border-b border-black/10 dark:border-white/10">
        {item.renderView ? item.renderView(item.value) : item.value ?? "-"}
      </div>
    </div>)
  );

  return (
    <div
      className={twMerge(
        "text-sm  bg-white dark:bg-[#242424] px-8 py-4 border border-black/10 dark:border-white/10 rounded-xl",
        className
      )}
    >
      {title && (
        <div className="text-lg font-semibold mb-3 bg-[#f9fafb] dark:bg-[#2a2a2a] rounded-t-xl px-4 py-2 border-b border-black/10 dark:border-white/10">
          {title}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 w-full border-t border-l border-black/10 dark:border-white/10">
        {regularItems.map(renderItem)}
      </div>

      {(descriptionItems) && descriptionItems.map((descriptionItem) => (
        !descriptionItem.hidden && <div key={descriptionItem.key}>
          <Divider />
          <div key={descriptionItem.key} className="w-full pb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {descriptionItem.icon && (
                <span className="text-base">{descriptionItem.icon}</span>
              )}
              <span className="font-bold">{descriptionItem.label}</span>
            </div>
            <div className="w-full text-sm font-medium">
              {descriptionItem.renderView
                ? descriptionItem.renderView(descriptionItem.value)
                : descriptionItem.value ?? "-"}
            </div>
          </div>
        </div>
      )
      )}
    </div>
  );
};

export default DetailBuilder;
