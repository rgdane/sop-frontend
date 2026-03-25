"use client";

import { Avatar as AvatarAntd, AvatarProps, Tooltip } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { useLayoutEffect, useState } from "react";

export default function Avatar(props: AvatarProps) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  return ready ? <AvatarAntd {...props} /> : null;
}

Avatar.Group = AvatarAntd.Group;

export function renderAvatar(
  users?: { name?: string; color?: string }[],
  size = 28,
  shape: AvatarProps["shape"] = "circle"
) {
  if (!users || users.length === 0) return "-";

  const getBackgroundColor = (color?: string) => {
    if (!color) return "#ffe2df";
    const isHex = /^#([0-9a-fA-F]{6})$/.test(color);
    return isHex ? `${color}20` : color;
  };

  const getBorderColor = (color?: string) => {
    if (!color) return "#ffe2df50";
    const isHex = /^#([0-9a-fA-F]{6})$/.test(color);
    return isHex ? `${color}50` : color;
  }

  const visibleUsers = users.slice(0, 4);
  const remaining = users.length - visibleUsers.length;

  return (
    <Avatar.Group>
      {visibleUsers.map((user, index) => {
        const initial = user.name?.slice(0, 2).toUpperCase() || "?";

        return (
          <Tooltip key={index} title={user.name}>
            <Avatar
              className="cursor-pointer"
              size={size}
              shape={shape}
              style={{
                borderColor: getBorderColor(user.color),
                backgroundColor: getBackgroundColor(user.color),
                color: user.color || "#ff6757",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              {initial}
            </Avatar>
          </Tooltip>
        );
      })}

      {remaining > 0 && (
        <Avatar
          className="cursor-pointer"
          size={size}
          style={{
            backgroundColor: "#ffcfca",
            color: "#ff6757",
            fontWeight: "bold",
            fontSize: "10px",
          }}
        >
          +{remaining}
        </Avatar>
      )}
    </Avatar.Group>
  );
}
