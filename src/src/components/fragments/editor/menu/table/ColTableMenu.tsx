import Button from "@/components/ui/Button";
import { MoreOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import tippy, { Instance } from "tippy.js";
import { ColTableTools } from "../../tools/table/ColTableTools";
import { Editor } from "@tiptap/core";

interface Props {
  coord: DOMRect | null;
  editor: Editor;
}

export const ColTableMenu = ({ coord, editor }: Props) => {
  const tippyInstance = useRef<Instance | null>(null);
  const colMenuRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!colMenuRef.current) return;

    const instance = tippy(document.body, {
      content: colMenuRef.current,
      trigger: "manual",
      placement: "bottom",
      appendTo: () => document.body,
      animation: "shift-toward",
      duration: 300,
      offset: [0, -12],
      interactive: true,
      hideOnClick: false,
      zIndex: 10000, // Higher than Ant Design Modal (typically 1000)
      getReferenceClientRect: () =>
        coord || ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect),
      onCreate: (instance) => {
        instance.popper.classList.add(
          "max-md:!sticky",
          "max-md:!bottom-0",
          "max-md:!top-auto",
          "max-md:!transform-none"
        );
      },
    });

    tippyInstance.current = instance;
    setIsReady(true);

    return () => {
      instance.destroy();
      tippyInstance.current = null;
      setIsReady(false);
    };
  }, []);

  useEffect(() => {
    if (!tippyInstance.current) return;

    if (coord) {
      tippyInstance.current.setProps({
        getReferenceClientRect: () => coord,
      });
      tippyInstance.current.show();
      tippyInstance.current.popperInstance?.update();
    } else {
      tippyInstance.current.hide();
    }
  }, [coord]);

  return (
    <div ref={colMenuRef}>
      <ColTableTools parentRef={colMenuRef} editor={editor} />
      <div className="transform rotate-90">
        <Button icon={<MoreOutlined />} />
      </div>
    </div>
  );
};
