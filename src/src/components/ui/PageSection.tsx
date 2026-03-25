"use client";

import { useEffect } from "react";
import { usePageTitle } from "../providers/PageTitleProvider";

interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  useTitleHeading?: boolean;
  extra?: React.ReactNode;
}

export const PageSection = (props: PageSectionProps) => {
  const { title, description, children, useTitleHeading = false } = props;
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title || "");
  }, [title]);

  return (
    <>
      {title && (
        <div className="">
          {useTitleHeading && (
            <div className="">
              <div className="text-2xl font-black">{`Manajemen ${title}`}</div>
              <div className="text-[16px] text-gray-600  dark:text-white/60 font-light">
                {description}
              </div>
            </div>
          )}
        </div>
      )}
      <div className={title ? "" : ""}>{children}</div>
    </>
  );
};
