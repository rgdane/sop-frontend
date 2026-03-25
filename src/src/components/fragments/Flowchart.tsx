"use client";

import { useEffect, useRef, useState } from "react";
import { diagramFormat } from "@/lib/diagramFormat";
import Loading from "@/app/loading";
import { Empty } from "antd";

type Props = {
  data: any;
  theme?: "default" | "dark" | "forest" | "neutral" | "null";
  header?: boolean;
};

export const Flowchart = ({ data, theme = "forest", header = true }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setErr("");
      setSvg("");

      const text = diagramFormat(data);
      if (!text?.trim()) {
        setErr("No diagram text.");
        return;
      }

      const mermaid = (await import("mermaid")).default;

      const currentTheme = isDark ? "dark" : theme;

      mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme,
        securityLevel: "loose",
        themeVariables: {
          primaryColor: isDark ? "#374151" : "#f3f4f6",
          primaryBorderColor: isDark ? "#6b7280" : "#000000 ",
          lineColor: isDark ? "#9ca3af" : "#000000",
          mainBkg: isDark ? "#2a2a2a" : "#f9fafb",
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
      });

      await new Promise((r) => requestAnimationFrame(() => r(null)));

      try {
        await mermaid.parse(text);
        const id = `mmd-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const { svg } = await mermaid.render(id, text);

        if (!cancelled) {
          let processedSvg = svg;

          processedSvg = processedSvg.replace(/<svg([^>]*)>/, `<svg$1>`);

          setSvg(processedSvg);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Mermaid render error.");
      }
    };

    run();

    const observer = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains("dark");
      if (darkNow !== isDark) {
        setIsDark(darkNow);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [data, theme, isDark]);

  return (
    <div className="flex flex-col">
      {header && (
        <div className="bg-[#f9fafb] dark:bg-[#2a2a2a] px-4 py-4 border-b border-black/10 dark:border-white/10">
          <div className="text-lg font-semibold">Diagram Alur</div>
        </div>
      )}
      {data.length > 0 ? (
        <div
          ref={containerRef}
          className="w-full  flex flex-col justify-center items-center"
        >
          {!svg && !err && <Loading />}
          {err && (
            <pre className="p-3 text-xs text-red-600 whitespace-pre-wrap">
              {err}
            </pre>
          )}
          {svg && (
            <div
              className={
                header
                  ? `overflow-auto max-h-[80vh] w-full py-4`
                  : `w-full py-4`
              }
            >
              <div
                className={`mermaid align-center justify-center flex overflow-auto max-w-full max-h-full rounded-lg `}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-[50vh] flex justify-center items-center">
          <Empty />
        </div>
      )}
    </div>
  );
};
