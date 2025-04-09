import React from "react";
import { createContext, useContext, ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

// Create a shared React context to ensure consistent React instance
export const ReactContext = createContext<typeof React | null>(null);

export function useReactContext() {
  const context = useContext(ReactContext);
  if (!context) {
    throw new Error("useReactContext must be used within a ReactProvider");
  }
  return context;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactContext.Provider value={React}>{children}</ReactContext.Provider>
  );
}
