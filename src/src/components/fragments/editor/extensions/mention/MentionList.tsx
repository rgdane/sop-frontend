import Avatar, { renderAvatar } from "@/components/ui/Avatar";
import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  Ref,
  useRef,
} from "react";

interface User {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
}

type MentionListProps = {
  items: User[];
  command: (item: { id: string; label: string }) => void;
  onClickOutside?: () => void;
};

export type MentionListRef = {
  onKeyDown: (params: { event: KeyboardEvent }) => boolean;
};

const MentionList = (props: MentionListProps, ref: Ref<MentionListRef>) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        props.onClickOutside?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props.onClickOutside]);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({
        id: item.id.toString(),
        label: item.name,
      });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="dropdown-menu bg-white dark:bg-[#2f2f2f] border rounded-2xl border-black/10 dark:border-white/10">
      {props.items.length ? (
        props.items.map((item, index) => {
          let rounded = "";
          if (props.items.length === 1) {
            rounded = "rounded-2xl";
          } else if (index === 0) {
            rounded = "rounded-t-2xl";
          } else if (index === props.items.length - 1) {
            rounded = "rounded-b-2xl";
          } else {
            rounded = "rounded-none";
          }

          return (
            <button
              className={`mention-item ${rounded} ${
                index === selectedIndex &&
                "is-selected bg-black/5 dark:bg-white/10"
              }`}
              key={item.id}
              onClick={() => selectItem(index)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                gap: "8px",
                transition: "background-color 0.1s ease",
              }}
            >
              {item.avatar_url ? (
                <Avatar size={24} src={item.avatar_url} />
              ) : (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {renderAvatar([{ name: item.name }])}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "500", fontSize: "14px" }}>
                  {item.name}
                </div>
                {item.email && (
                  <div
                    style={{
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.email}
                  </div>
                )}
              </div>
            </button>
          );
        })
      ) : (
        <div
          className="item"
          style={{
            padding: "12px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          No users found
        </div>
      )}
    </div>
  );
};

export default forwardRef(MentionList);
