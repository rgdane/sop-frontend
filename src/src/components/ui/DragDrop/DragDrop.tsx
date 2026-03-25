import { usePermissions } from "@/components/providers/PermissionProvider";
import { useAuthAction } from "@/features/auth/hook/useAuth";
import { HolderOutlined } from "@ant-design/icons";

interface DragDropProps {
  /** Identitas drag (pengganti React key) */
  dragKey: string;

  /** Apakah elemen ini bisa di-drag */
  draggable: boolean;

  /** Event handler drag */
  onDragStart?: React.DragEventHandler<HTMLSpanElement>;

  /** Icon atau visual custom */
  visual?: {
    handles?: {
      reorder?: React.ReactNode;
      hierarchy?: React.ReactNode;
    };
  };

  /** Kelas tambahan */
  className?: string;

  /** Tooltip/title */
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
  const { getCurrentPermissions } = useAuthAction();
  const { modules } = usePermissions();

  const currentPermissions = modules ? getCurrentPermissions(modules) : null;
  const hasPermission = Array.isArray(currentPermissions)
    ? currentPermissions.includes("update")
    : !!currentPermissions?.update;

  if (!hasPermission) return null;

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
