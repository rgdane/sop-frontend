import Button from "@/components/ui/Button";
import {
  DeleteFilled,
  DeleteOutlined,
  MergeCellsOutlined,
} from "@ant-design/icons";
import { Editor } from "@tiptap/core";
import { Tooltip } from "antd";
import { TbTableRow } from "react-icons/tb";

interface Props {
  editor: Editor;
}

interface ToolsType {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}

export const TableTools = ({ editor }: Props) => {
  const tools: ToolsType[] = [
    {
      key: "mergeTableCells",
      icon: <MergeCellsOutlined className="!text-lg" />,
      label: "Merge Cells",
      onClick: (e: React.MouseEvent) => {
        editor.chain().focus().mergeCells().run();
      },
    },
    {
      key: "toggleHeaderCell",
      icon: <TbTableRow className="!text-lg" />,
      label: "Toggle Header",
      onClick: (e: React.MouseEvent) => {
        editor.chain().focus().toggleHeaderCell().run();
      },
    },
  ];

  return (
    <>
      <div className="bg-white dark:bg-[#454545] border border-black/10 dark:border-white/10 px-2 py-1 rounded-lg">
        <div className="flex items-center gap-x-1">
          {tools.map((item: ToolsType, index: number) => {
            return (
              <div key={item.key} className="">
                <Tooltip title={item.label} placement="top" getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}>
                  <Button
                    className="w-full !p-2 dark:hover:!bg-white/10"
                    type="text"
                    icon={item.icon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick(e);
                      editor.commands.setTextSelection(
                        editor.state.selection.to
                      );
                    }}
                    onMouseDown={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
