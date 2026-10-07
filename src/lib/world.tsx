import { createContext, useContext, useState, type ReactNode } from "react";

interface World {
  /** true once Priya has stepped through the opening screen */
  entered: boolean;
  setEntered: (v: boolean) => void;
}

const WorldCtx = createContext<World>({ entered: false, setEntered: () => undefined });

export function WorldProvider({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(() => sessionStorage.getItem("echoes:entered") === "1");
  const set = (v: boolean) => {
    sessionStorage.setItem("echoes:entered", v ? "1" : "0");
    setEntered(v);
  };
  return <WorldCtx.Provider value={{ entered, setEntered: set }}>{children}</WorldCtx.Provider>;
}

export const useWorld = () => useContext(WorldCtx);

/** Fire the hidden easter egg from anywhere. */
export const EGG_EVENT = "echoes:egg";
export const triggerEgg = () => window.dispatchEvent(new Event(EGG_EVENT));
