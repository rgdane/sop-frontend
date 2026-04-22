import { HolderOutlined } from "@ant-design/icons";

interface DragDropProps {
  dragKey: string;
  draggable: boolean;
  onDragStart?: React.DragEventHandler<HTMLSpanElement>;
  visual?: {
    handles?: {
      reorder?: React.ReactNode;
      hierarchy?: React.ReactNode;
    };
  };
  className?: string;
  title?: string;
}

export const DragDrop = ({
  dragKey,
  draggable,
  onDragStart,
  visual,
  className,
  title,
}: DragDropProps) => {
  return (
    <span
      draggable={draggable}
      onDragStart={onDragStart}
      className={className}
      title={title}
    >
      {dragKey === "reorder"
        ? visual?.handles?.reorder ?? <HolderOutlined />
        : visual?.handles?.hierarchy ?? <HolderOutlined />}
    </span>
  );
};