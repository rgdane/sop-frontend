import { Divider } from "antd";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export type TrackerProgressDataType = {
  progress: number;
  total: number;
};

interface TrackerProgressProps {
  data: TrackerProgressDataType;
  title?: string;
  color?: string;
  className?: string;
  reverse?: boolean;
}

export const TrackerProgress = ({
  data: { progress, total },
  title = "Tracker",
  color = "#F1A873",
  className,
  reverse = false,
}: TrackerProgressProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(reverse ? 100 : 0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const percentage = total > 0 ? Math.min((progress / total) * 100, 100) : 0;
  const isCompleted = progress >= total;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage);
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, total]);

  return (
    <div
      className={twMerge(
        "bg-white dark:bg-[#242424] w-full py-4 px-6 rounded-2xl border border-black/10 dark:border-white/10",
        className
      )}
    >
      <div className="font-black text-xl mb-3">{title}</div>

      <div className="flex items-center justify-between mb-2">
        {reverse ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Sisa</div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Progress
          </div>
        )}
        <div className="text-sm font-semibold">
          {progress}/{total} ({percentage.toFixed(0)}%)
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Isi bar */}
        <div
          className="h-full rounded-full absolute top-0"
          style={{
            width: `${animatedProgress}%`,
            backgroundColor: color,
            transition: isInitialLoad
              ? "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
              : "width 0.5s ease-out",
            // 🔥 magic di sini:
            right: "auto",
            left: 0,
            transformOrigin: reverse ? "right center" : "left center",
          }}
        >
          {/* Shimmer effect */}
          {animatedProgress > 0 && animatedProgress < 100 && (
            <div
              className="absolute top-0 h-full opacity-30 overflow-hidden"
              style={{
                // Lebar shimmer = progress bar saat ini
                width: `${animatedProgress}%`,
                // arah shimmer: kalau reverse, mulai dari kanan
                left: reverse ? "auto" : 0,
                right: reverse ? 0 : "auto",
                background: `linear-gradient(
                              90deg,
                              transparent,
                              rgba(255,255,255,0.4),
                              transparent
                            )`,
                backgroundSize: "200% 100%",
                animation: reverse
                  ? "shimmer-reverse 2s infinite linear"
                  : "shimmer 2s infinite linear",
              }}
            />
          )}
        </div>
      </div>

      <Divider />

      {/* Status Text */}
      <div className="text-xs text-right">
        {isCompleted && !reverse ? (
          <span className="text-green-600 dark:text-green-400 font-medium">
            ✓ Completed
          </span>
        ) : reverse ? (
          <span
            style={{ backgroundColor: `${color}20`, color }}
            className="font-bold p-2 rounded-xl"
          >
            {progress} tersisa
          </span>
        ) : (
          <span
            style={{ backgroundColor: `${color}20`, color }}
            className="font-bold p-2 rounded-xl"
          >
            {total - progress} tersisa
          </span>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
