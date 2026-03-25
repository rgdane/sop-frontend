import React, { createContext, useContext, useState } from "react";

const PageTitleContext = createContext<{
  title: string;
  setTitle: (t: string) => void;
  useBack?: boolean;
  setUseBack: (useBack: boolean) => void;
}>({
  title: "",
  setTitle: () => {},
  useBack: false,
  setUseBack: () => {},
});

export const usePageTitle = () => useContext(PageTitleContext);

export const PageTitleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [title, setTitle] = useState<string>("");
  const [useBack, setUseBack] = useState(false);

  return (
    <PageTitleContext.Provider value={{ title, setTitle, useBack, setUseBack }}>
      {children}
    </PageTitleContext.Provider>
  );
};
