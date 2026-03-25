import { cn } from "@/lib/tailwindMerge";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

function CommandsList(props: any, ref: any) {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const scrollContainer = useRef<HTMLDivElement | null>(null);

  const activeItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useImperativeHandle(ref, () => {
    return {
      onKeyDown,
    };
  });

  useEffect(() => {
    if (!scrollContainer.current) {
      return;
    }
    const activeItemIndex = selectedGroupIndex * 1000 + selectedCommandIndex;
    const activeItem = activeItemRefs.current[activeItemIndex];
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [selectedCommandIndex, selectedGroupIndex]);

  function onKeyDown({ event }: any) {
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
  }

  function upHandler() {
    if (props.items.length === 0) {
      return false;
    }
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
    if (props.items.length === 0) {
      return false;
    }
    const commands = props.items[selectedGroupIndex].commands;
    let newCommandIndex = selectedCommandIndex + 1;
    let newGroupIndex = selectedGroupIndex;

    if (commands.length - 1 < newCommandIndex) {
      newCommandIndex = 0;
      newGroupIndex = selectedGroupIndex + 1;
    }
    if (props.items.length - 1 < newGroupIndex) {
      newGroupIndex = 0;
    }
    setSelectedCommandIndex(newCommandIndex);
    setSelectedGroupIndex(newGroupIndex);
  }

  function enterHandler() {
    if (
      props.items.length === 0 ||
      selectedGroupIndex === -1 ||
      selectedCommandIndex === -1
    ) {
      return false;
    }

    selectItem(selectedGroupIndex, selectedCommandIndex);
  }

  function selectItem(groupIndex: number, commandIndex: number) {
    const command = props.items[groupIndex].commands[commandIndex];
    props.command(command);
  }

  function createCommandClickHandler(groupIndex: number, commandIndex: number) {
    selectItem(groupIndex, commandIndex);
  }
  function setActiveItemRef(groupIndex: number, commandIndex: number, el: any) {
    activeItemRefs.current[groupIndex * 1000 + commandIndex] = el;
  }

  return (
    <div
      className="bg-white dark:bg-[#363636] border-black/10 dark:border-white/10  shadow border px-2 rounded-md py-2"
      ref={scrollContainer}
      style={{
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      {props?.items?.length ? (
        <div className="flex flex-col gap-y-4">
          {props?.items?.map((group: any, groupIndex: any) => {
            return (
              <div className="flex flex-col items-start" key={groupIndex}>
                <div className=" text-xs pb-2">{group.title}</div>
                {group.commands.map((command: any, commandIndex: any) => {
                  const isSelected =
                    selectedGroupIndex === groupIndex &&
                    selectedCommandIndex === commandIndex;

                  return (
                    <button
                      className={cn(
                        "flex gap-x-4 gap-y-2 items-center px-2 py-2 w-full rounded-md hover:bg-black/5 hover:dark:bg-white/10",
                        {
                          "bg-black/5 hover:bg-black/5 dark:bg-white/10 hover:dark:bg-white/10":
                            isSelected,
                        }
                      )}
                      ref={(el) =>
                        setActiveItemRef(groupIndex, commandIndex, el)
                      }
                      key={`command-${commandIndex}`}
                      onClick={() =>
                        createCommandClickHandler(groupIndex, commandIndex)
                      }
                    >
                      <div className="border border-black/10 dark:border-white/10  rounded-md p-2 h-auto items-center flex flex-col justify-center">
                        {command.icon && React.createElement(command.icon)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm">{command.label}</span>
                        <span className=" text-xs text-start">
                          {command.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default forwardRef(CommandsList);
