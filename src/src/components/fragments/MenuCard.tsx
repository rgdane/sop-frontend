"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface MenuCardProps {
  title?: string;
  description: string;
  icon?: React.ComponentType<any>;
  color?: string;
  url?: string;
}

export const MenuCard = ({ items }: { items: MenuCardProps[] }) => {
  const router = useRouter();

  const handleCardClick = (url?: string) => {
    if (url) {
      router.push(url);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-6 justify-start">
        {items.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <div
              key={index}
              onClick={() => handleCardClick(item.url)}
              role="button"
              tabIndex={item.url ? 0 : -1}
              onKeyDown={(e) => {
                if (item.url && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleCardClick(item.url);
                }
              }}
              className={`group relative bg-[#1c416d] dark:bg-slate-800 text-white rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:shadow-slate-900/50 dark:hover:shadow-slate-900/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 w-full lg:w-[calc(25%-12px)] ${
                item.url
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60 hover:translate-y-0"
              }`}
            >
              {/* Content */}
              <div className="relative p-6 flex items-center gap-4">
                {/* Icon Container */}
                {IconComponent && (
                  <div className="flex-shrink-0 w-16 h-16 bg-white/10 dark:bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/20 dark:group-hover:bg-white/10 transition-colors backdrop-blur-sm">
                    <IconComponent
                      style={{ fontSize: "2.25rem" }}
                      className=" transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="flex-1 text-left">
                  {item.title && (
                    <h3 className="text-base font-semibold mb-1 text-white group-hover:text-blue-100 dark:group-hover:text-slate-100 transition-colors">
                      {item.title}
                    </h3>
                  )}
                  <p className="text-xs text-blue-100/70 dark:text-slate-300/70 group-hover:text-blue-100/90 dark:group-hover:text-slate-300/90 transition-colors">
                    {item.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                {item.url && (
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-white dark:text-slate-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Bottom Border Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 dark:bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          );
        })}
      </div>
    </>
  );
};
