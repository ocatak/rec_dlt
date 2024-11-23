"use client";

import React, { useEffect, useState } from "react";
import FileUpload from "./fileUpload";
import { useConnectionContext } from "@/context/connection";

export default function EstablishConnection({
  connected,
  setConnected,
}: {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}) {

  const { isConnected, setIsConnected } = useConnectionContext();
  
  // useEffect(() => {
  //   console.log(isConnected, connected);
  // }, [isConnected, connected]);
  return (
    <>
      <hr className="mt-10 border-t-1 border-[#0a0a0a] w-[400px] md:w-[600px] mx-auto mb-[20px]" />
      <div>
        {connected ? (
          <>
            <p className="font-bold text-green-900 text-[20px] mt-5 mb-5 md:text-[30px]">
              Connected with{" "}
              <span className="text-[25px] md:text-[35px]">
                {localStorage.getItem("selectedOrg")}
              </span>{" "}
            </p>
            <FileUpload />
          </>
        ) : (
          <p className="text-red-500 text-[20px] md:text-[30px]">
            Not connected with any REC organization
          </p>
        )}
        <hr className="mt-10 mb-10 border-t-1 border-[#0a0a0a] w-[400px] md:w-[600px] mx-auto" />
        {connected && (
          <button
            className="bg-red-400 text-white hover:bg-red-800 font-bold h-[40px] w-[150px] rounded-md"
            onClick={() => {
              console.log("Disconnecting");
              setIsConnected(false);
              setConnected(false);
              localStorage.removeItem("isConnected");
              localStorage.removeItem("name");
            }}
          >
            Disconnect
          </button>
        )}
      </div>
    </>
  );
}
