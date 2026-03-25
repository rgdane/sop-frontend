"use client";

import { Tag as TagAntd, TagProps } from "antd";

export default function Tag(props: TagProps) {
  return <TagAntd {...props} />;
}

export const renderTexts = (datas?: any[], field?: string) => {
  if (!datas || datas.length === 0) {
    return "-";
  }

  const namesArray = datas.map((data) => data[field || "name"]);
  return namesArray.join(", ");
};

export const renderTags = (datas?: any[], field?: string) => {
  if (!datas || datas.length === 0) return <>-</>;
  const fallbackColor = "#1890ff";
  const finalColor = fallbackColor;

  return (
    <>
      {datas.map((data, index) => (
        <Tag
          key={data?.id ?? data?.code ?? data?.name ?? `${field || "name"}-${index}`}
          style={{
            border: `1px solid ${finalColor}`,
            backgroundColor: `${finalColor}30`,
            color: finalColor,
          }}
        >
          <div className="font-semibold">
            {data[field || "name"]}
          </div>
        </Tag>
      ))}
    </>
  );
};

export const renderTag = (name?: string, color?: string, key?: React.Key) => {
  const fallbackColor = "#1890ff";
  const baseColor = color || fallbackColor;

  const textColor = darkenColor(baseColor, 40);
  const borderColor = darkenColor(baseColor, 20);
  const backgroundColor = `${baseColor}30`;

  return (
    <Tag
      key={key ?? `${name ?? "tag"}-${color ?? fallbackColor}`}
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="font-semibold">{name}</div>
    </Tag>
  );
};


const darkenColor = (hex: string, amount = 30) => {
  const c = hex.replace("#", "");
  const r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount);

  return `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
};
