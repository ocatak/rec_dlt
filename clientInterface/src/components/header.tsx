"use client";
import { useConnectionContext } from "@/context/connection";
import { deleteCookie, getCookie } from "@/lib/cookieHandler";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuthenticatedContext } from "@/context/authentication";
import Image from "next/image";
function Header() {
  const router = useRouter();
  const { setIsAuthenticated, isAuthenticated } = useAuthenticatedContext();
  const { setIsConnected } = useConnectionContext();
  const [showProfile, setShowProfile] = useState(false);
  const logoutHandler = () => {
    deleteCookie();
    setShowProfile(false)
    setIsAuthenticated(false);
    setIsConnected(false);
    localStorage.clear();
    router.push('/log-in');
  };

  return (
    <nav className="bg-gray-800 h-[80px] lg:h-[90px]">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center ">
          <div className="flex-1 flex-shrink-0 items-center text-white  text-xl md:text-3xl">
            <Link href={"/"}>
              REC Client{" "}
              <svg
                className="inline-block mt-[-15px]"
                xmlns="http://www.w3.org/2000/svg"
                width=".8em"
                height=".8em"
                viewBox="0 0 20 20"
              >
                <path
                  fill="currentColor"
                  d="M10 9.25c-2.27 0-2.73-3.44-2.73-3.44C7 4.02 7.82 2 9.97 2c2.16 0 2.98 2.02 2.71 3.81c0 0-.41 3.44-2.68 3.44m0 2.57L12.72 10c2.39 0 4.52 2.33 4.52 4.53v2.49s-3.65 1.13-7.24 1.13c-3.65 0-7.24-1.13-7.24-1.13v-2.49c0-2.25 1.94-4.48 4.47-4.48z"
                />
              </svg>
            </Link>
          </div>
          <div className="flex space-x-5">
            <Link
              href="/organizations"
              className="text-white md:text-2xl hover:text-green-400 hover:scale-105 px-1 md:px-2 rounded"
            >
              <button>Organizations</button>
            </Link>
            <Link
              href="/connected-organizations"
              className="text-white md:text-2xl hover:text-green-400 hover:scale-105 px-1 md:px-2 rounded"
            >
              <button>Connections</button>
            </Link>
            {isAuthenticated ? (
              <>
              <div className="relative">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowProfile(!showProfile);
                      
                    }}
                    className="text-white md:text-2xl hover:text-green-400 hover:scale-105  px-1 md:px-2 rounded"
                  >
                    {localStorage.getItem("email")?.split("@")[0]}
                  </button>
                  <Image
                    src="/user.png"
                    alt="profile"
                    width={16}
                    height={16}
                    className="w-[24px] h-[24px] mt-1"
                  />
                </div>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    
                    <Link
                      href="#"
                      onClick={() => setShowProfile(false)}
                      className="block px-4 py-2 text-md font-bold text-center text-gray-700 hover: cursor-default"
                    >
                      {localStorage.getItem("email")}
                    </Link>
                    <Link
                      href="/log-in"
                      onClick={logoutHandler}
                      className="block px-4 py-2 text-md font-bold text-center text-red-700 bg-gray-200"
                    >
                      <button >Log Out</button>
                    </Link>
                  </div>
                )}
              </div>
            </>
            ) : (
              <Link
                href="/log-in"
                className="text-white md:text-2xl  hover:text-green-400 hover:scale-105 px-1 md:px-2 rounded"
              >
                <button>Log In</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
