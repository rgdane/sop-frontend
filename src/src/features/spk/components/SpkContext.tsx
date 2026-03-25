import { Spk } from "@/types/data/spk.types";
import { createContext, useContext } from "react";

interface SpkContextValue {
  spk: Spk | null;
  path: string;
  setSpk: (spk: Spk | null) => void; // fungsi update
}

export const SpkContext = createContext<SpkContextValue>({
  spk: null,
  path: "",
  setSpk: () => {}, // default noop function
});

export const useSpkContext = () => useContext(SpkContext);
