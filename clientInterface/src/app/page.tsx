"use client"
import EstablishConnection from "../components/establish-connection";
import Welcome from "@/components/welcome";
import { useConnectionContext } from "@/context/connection";
import { useEffect, useState } from "react";

export default function Home() {
  const {isConnected} = useConnectionContext()
  const [connected, setConnected] = useState(false )
  useEffect(() => {
    setConnected(localStorage.getItem("isConnected") === "true" ? true : false)
  }, [])
  return (
    <main className="flex min-h-screen flex-col items-center px-24 pt-10 text-center">
      <div className="mb-[150px]">
          <Welcome />
          <EstablishConnection connected={connected} setConnected = {setConnected}/>
      </div>

    </main>
  );
}
