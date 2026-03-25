"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface NavbarContextType {
  content: ReactNode | null;
  setContent: (node: ReactNode | null) => void;
  clearContent: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);

  const value = useMemo(
    () => ({
      content,
      setContent,
      clearContent: () => setContent(null),
    }),
    [content]
  );

  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within NavbarProvider");
  }
  return context;
};
