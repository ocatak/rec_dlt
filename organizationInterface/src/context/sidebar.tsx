"use client";

import { ReactNode, createContext, useContext, useState } from "react";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps>({
  open: true,
  setOpen: () => {},
});

interface ContextWrapperProps {
    children: ReactNode;
  }

export function SidebarContextWrapper({children}: ContextWrapperProps){
    const [open, setOpen] = useState<SidebarContextProps['open']>(true)

    return (
        <SidebarContext.Provider value={{open, setOpen}}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebarContext(){
    return useContext(SidebarContext)
}