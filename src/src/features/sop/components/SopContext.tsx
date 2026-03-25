import { Division } from "@/types/data/division.types";
import { Sop } from "@/types/data/sop.types";
import { createContext, useContext } from "react";

interface SopContextValue {
  sop: Sop | null;
  divisions?: Division[] | null;
  path: string;
  setSop: (sop: Sop | null) => void; // fungsi update
}

export const SopContext = createContext<SopContextValue>({
  sop: null,
  divisions: null,
  path: "",
  setSop: () => {}, // default noop function
});

export const useSopContext = () => useContext(SopContext);
