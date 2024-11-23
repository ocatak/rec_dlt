"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";

interface ConnectionContextProps {
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConnectionContext = createContext<ConnectionContextProps>({
  isConnected: false,
  setIsConnected: () => {},
});

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // useEffect(() => {
    
  // }, []);

  // useEffect(() => {
  // }, [isConnected]);

  return (
    <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnectionContext() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnectionContext must be used within a ConnectionProvider");
  }
  return context;
}


