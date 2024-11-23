"use client";

import { getCookie } from "@/lib/cookieHandler";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface AuthenticatedContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  const AuthenticatedContext = createContext<AuthenticatedContextProps>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
  });
  
  interface ContextWrapperProps {
    children: ReactNode;
  }
  export function AuthenticatedContextWrapper({ children }: ContextWrapperProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<AuthenticatedContextProps["isAuthenticated"]>(false);

    useEffect(() => {
      const fetchCookie = async () => {
        const cookie = await getCookie();
        setIsAuthenticated(!!cookie);
      };
      fetchCookie();
    }, []);

    return (
      <AuthenticatedContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        {children}
      </AuthenticatedContext.Provider>
    );
  }
  
  export function useAuthenticatedContext() {
    return useContext(AuthenticatedContext);
  }