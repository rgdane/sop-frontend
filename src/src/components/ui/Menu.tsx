import React, { memo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "antd";
import type { MenuProps } from "antd";

interface MenuWrapperProps extends MenuProps {}

// Dynamic import Ant Design Menu dengan SSR disabled
const MenuAntd = dynamic(
  () => import("antd").then((mod) => ({ default: mod.Menu })),
  {
    ssr: false,
    loading: () => <MenuSkeleton />,
  }
);

// Menu skeleton component menggunakan Ant Design Skeleton
const MenuSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {/* Menu items skeleton */}
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton.Avatar active size="small" shape="square" />
          <Skeleton.Input
            active
            size="small"
            style={{ width: "70%", height: "20px" }}
          />
        </div>
      ))}

      {/* Submenu skeleton dengan indentasi */}
      <div className="ml-6 space-y-3">
        {[...Array(3)].map((_, index) => (
          <div key={`sub-${index}`} className="flex items-center space-x-3">
            <Skeleton.Avatar active size={16} shape="circle" />
            <Skeleton.Input
              active
              size="small"
              style={{ width: "60%", height: "16px" }}
            />
          </div>
        ))}
      </div>

      {/* Menu items lainnya */}
      {[...Array(3)].map((_, index) => (
        <div key={`more-${index}`} className="flex items-center space-x-3">
          <Skeleton.Avatar active size="small" shape="square" />
          <Skeleton.Input
            active
            size="small"
            style={{ width: "65%", height: "20px" }}
          />
        </div>
      ))}
    </div>
  );
};

const MenuComponent: React.FC<MenuWrapperProps> = memo((props) => {
  return <MenuAntd {...props} />;
});

MenuComponent.displayName = "Menu";

export const Menu = MenuComponent;
