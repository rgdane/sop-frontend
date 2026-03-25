"use client";
import { useLayoutEffect, useState } from "react";
import { Card, Button, Dropdown, Input } from "antd";
import type { MenuProps } from "antd";
import {
  DeleteOutlined,
  BgColorsOutlined,
  StarFilled,
} from "@ant-design/icons";

type Props = {
  id: number;
  user?: string;
  text: string;
  setText?: (text: string) => void;
  vote?: number;
  color?: string;
  setColor?: (color: string) => void;
  isPrivate: boolean;
  onDelete: (id: number) => void;
  onUpdate?: (id: number, data: any) => void;
};

const colors = [
  "#bdefe2",
  "#e0fcc5",
  "#ffebc2",
  "#ffd7c2",
  "#fcc5cf",
  "#e3c9f7",
  "#bed4ef",
];

export function RetroCard({
  id,
  user,
  text,
  setText,
  vote = 0,
  color = "#bdefe2",
  setColor,
  isPrivate = false,
  onDelete,
  onUpdate,
}: Props) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  const handleDelete = () => {
    onDelete(id);
  };

  const handleVote = () => {
    onUpdate && onUpdate(id, { text: text, vote: vote + 1 });
  };

  const handleColorChange = (c: string) => {
    setColor && setColor(c);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let textValue = e.target.value;
    const lines = textValue.split("\n");
    if (lines.length > 3) {
      textValue = lines.slice(0, 3).join("\n");
    }
    setText && setText(textValue);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const lines = text.split("\n");
      if (lines.length >= 3) {
        e.preventDefault();
      }
    }
  };

  const colorItems: MenuProps["items"] = colors.map((c) => ({
    key: c,
    label: (
      <div
        className="w-5 h-5 rounded-full cursor-pointer border-2 border-gray-300"
        style={{ backgroundColor: c }}
      />
    ),
    onClick: () => handleColorChange(c)
  }));
  const { TextArea } = Input;

  if (!ready) return null;

  return (
    <>
      <Card
        size="small"
        className="rounded-xl shadow-md border-2 my-2"
        style={{ backgroundColor: color }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          {!isPrivate ? (
            <span className="font-bold text-gray-800 truncate min-w-0">
              {user || "(Anonymous)"}
            </span>
          ) : (
            <span></span>
          )}
          <div className="flex gap-2">
            {isPrivate && (
              <Dropdown menu={{ items: colorItems }}>
                <Button
                  type="text"
                  size="small"
                  icon={<BgColorsOutlined style={{ color: "#4465e9" }} />}
                />
              </Dropdown>
            )}
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            />
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 mb-2 break-words">
          {isPrivate ? (
            <TextArea
              autoSize={{ minRows: 1 }}
              placeholder="Note..."
              variant="borderless"
              style={{ color: "#000" }}
              value={text}
              className="overflow-hidden placeholder-gray"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          ) : (
            text
          )}
        </p>

        {/* Footer */}
        {!isPrivate && (
          <div className="flex justify-end items-center gap-1">
            <span className="text-gray-600 text-sm">{vote}</span>
            <StarFilled
              style={{ color: "#FFD700", stroke: "#000", strokeWidth: 10 }}
              onClick={handleVote}
            />
          </div>
        )}
      </Card>
    </>
  );
}
