import { cn } from "@/lib/tailwindMerge";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

function DollarNode(props: any, ref: any) {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);

  const scrollContainer = useRef<HTMLDivElement | null>(null);
  const activeItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useImperativeHandle(ref, () => ({ onKeyDown }));

  useEffect(() => {
    const activeItem =
      activeItemRefs.current[selectedGroupIndex * 1000 + selectedCommandIndex];
    activeItem?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedCommandIndex, selectedGroupIndex]);

  function onKeyDown({ event }: any) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      upHandler();
      return true;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      downHandler();
      return true;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      enterHandler();
      return true;
    }
    return false;
  }

  function upHandler() {
    if (!props.items.length) return;
    let newCommandIndex = selectedCommandIndex - 1;
    let newGroupIndex = selectedGroupIndex;

    if (newCommandIndex < 0) {
      newGroupIndex = selectedGroupIndex - 1;
      newCommandIndex = props.items[newGroupIndex]?.commands.length - 1 || 0;
    }
    if (newGroupIndex < 0) {
      newGroupIndex = props.items.length - 1;
      newCommandIndex = props.items[newGroupIndex].commands.length - 1;
    }
    setSelectedCommandIndex(newCommandIndex);
    setSelectedGroupIndex(newGroupIndex);
  }

  function downHandler() {
    if (!props.items.length) return;
    const commands = props.items[selectedGroupIndex].commands;
    let newCommandIndex = selectedCommandIndex + 1;
    let newGroupIndex = selectedGroupIndex;

    if (commands.length - 1 < newCommandIndex) {
      newCommandIndex = 0;
      newGroupIndex = selectedGroupIndex + 1;
    }
    if (props.items.length - 1 < newGroupIndex) newGroupIndex = 0;

    setSelectedCommandIndex(newCommandIndex);
    setSelectedGroupIndex(newGroupIndex);
  }

  function enterHandler() {
    if (!props.items.length) return;
    selectItem(selectedGroupIndex, selectedCommandIndex);
  }

  function selectItem(groupIndex: number, commandIndex: number) {
    const group = props.items[groupIndex];
    const command = group.commands[commandIndex];
    props.command(command);

    // ✅ Jika group adalah "language", tandai sebagai aktif
    if (group.name === "language") {
      setActiveLanguage(command.name);
    }
  }

  function createCommandClickHandler(groupIndex: number, commandIndex: number) {
    selectItem(groupIndex, commandIndex);
  }

  function setActiveItemRef(groupIndex: number, commandIndex: number, el: any) {
    activeItemRefs.current[groupIndex * 1000 + commandIndex] = el;
  }

  return (
    <div
      className="bg-white dark:bg-[#363636] border border-black/10 dark:border-white/10 shadow px-2 rounded-md py-2"
      ref={scrollContainer}
      style={{ maxHeight: "300px", overflowY: "auto" }}
    >
      {props?.items?.length ? (
        <div className="flex flex-col gap-y-4">
          {props.items
            // ✅ Sembunyikan grup "words" jika belum memilih bahasa
            .filter(
              (group: any) =>
                group.name === "language" ||
                (group.name === "words" && activeLanguage)
            )
            .map((group: any, groupIndex: number) => (
              <div className="flex flex-col items-start" key={groupIndex}>
                <div className="text-xs pb-2">{group.title}</div>
                {group.commands.map((command: any, commandIndex: number) => {
                  const isSelected =
                    selectedGroupIndex === groupIndex &&
                    selectedCommandIndex === commandIndex;
                  const isActiveLanguage =
                    group.name === "language" &&
                    command.name === activeLanguage;

                  return (
                    <button
                      key={`command-${groupIndex}-${commandIndex}`}
                      className={cn(
                        "flex gap-x-4 items-center px-2 py-2 w-full rounded-md transition-colors",
                        {
                          "hover:bg-black/5 hover:dark:bg-white/10":
                            !isActiveLanguage,
                          "bg-black/5 dark:bg-white/10": isSelected,
                        }
                      )}
                      ref={(el) =>
                        setActiveItemRef(groupIndex, commandIndex, el)
                      }
                      onMouseEnter={() => {
                        setSelectedGroupIndex(groupIndex);
                        setSelectedCommandIndex(commandIndex);
                      }}
                      onClick={() =>
                        createCommandClickHandler(groupIndex, commandIndex)
                      }
                    >
                      <div
                        className={cn(
                          "border rounded-md p-2 flex items-center justify-center",
                          {
                            "border-black/10 dark:border-white/10":
                              !isActiveLanguage,
                            "border-green-500": isActiveLanguage,
                          }
                        )}
                      >
                        {command.icon && React.createElement(command.icon)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm flex items-center gap-2">
                          {command.label}
                          {isActiveLanguage && (
                            <span className="text-green-600">✓</span>
                          )}
                        </span>
                        <span className="text-xs text-start">
                          {command.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}

export default forwardRef(DollarNode);
