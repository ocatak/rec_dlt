"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Message, User } from "@/lib/constants";

const GraphPlot = dynamic(() => import("@/components/plot"), { ssr: false });
const Sidebar = dynamic(() => import("@/components/sidebar"), { ssr: false });

export default function Clients() {
  const [user, setUser] = useState<User | null>(null); 
  const [msg, setMsg] = useState<Message | null>(null);

  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";  
  const name = searchParams?.get("name") || "";

  return (
    <div className="flex h-screen flex-row bg-gray-100 text-gray-800">
      <Sidebar setMsg={setMsg} setUser={setUser} name={name} email={email} />

      <main className="main flex-1 flex-col pl-4 transition-all duration-150 ease-in md:ml-0">
        <div className="flex flex-col items-center pt-5 md:pt-10 text-center"></div>

        {msg && user && <GraphPlot msg={msg} user={user} name={name} />}
      </main>
    </div>
  );
}
