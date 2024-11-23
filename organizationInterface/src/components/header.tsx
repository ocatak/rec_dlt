"use client";
import { useSidebarContext } from "@/context/sidebar";
import { useAuthenticatedContext } from "@/context/authentication";
import { deleteCookie } from "@/lib/cookieHandler";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function Header() {
  const { open, setOpen } = useSidebarContext();
  const { isAuthenticated, setIsAuthenticated } = useAuthenticatedContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();
  const logoutHandler = () => {
    deleteCookie();
    setShowProfile(false);
    localStorage.clear();
    setIsAuthenticated(false);
    router.push("/log-in");
  };

  return (
    <nav className="bg-gray-800 h-[80px] lg:h-[90px]">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center ">
          <button
            className="lg:hidden ml-3 text-white"
            onClick={() => setOpen(!open)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <div className="flex-1 flex-shrink-0 items-center text-white text-xl md:text-3xl">
            <Link href={"/"} prefetch={false}>
              REC Orgnization{" "}
              <svg
                className="inline-block mt-[-15px]"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M20 18h-6a3 3 0 0 0-3 3v2h2v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2h2v-2a3 3 0 0 0-3-3m-3-1a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0-6a2 2 0 1 1 0 4a2 2 0 0 1 0-4"
                />
                <path
                  fill="currentColor"
                  d="M17 30C9.28 30 3 23.72 3 16h2c0 6.617 5.383 12 12 12c5.226 0 9.816-3.338 11.421-8.307l1.904.614A13.961 13.961 0 0 1 17 30m14-14h-2c0-6.617-5.383-12-12-12V2c7.72 0 14 6.28 14 14M6 14l-2.139-1.013A5.022 5.022 0 0 1 1 8.467V2h10v6.468a5.021 5.021 0 0 1-2.861 4.52zM3 4v4.468a3.01 3.01 0 0 0 1.717 2.71L6 11.787l1.283-.607A3.012 3.012 0 0 0 9 8.468V4z"
                />
              </svg>
            </Link>
          </div>
          <div className="flex space-x-5">
            <div className="relative">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setShowProfile(false);
                }}
                className="text-white md:text-2xl hover:text-green-400 hover:scale-105 md:px-2 rounded"
              >
                Connections ▼
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/clients"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-md font-bold  text-gray-700 hover:text-green-700 hover:bg-gray-200"
                  >
                    Clients
                  </Link>
                  <Link
                    href="/connected-organizations"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-md font-bold  text-gray-700 hover:text-green-700 hover:bg-gray-200"
                  >
                    Organizations
                  </Link>
                </div>
              )}
            </div>
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowProfile(!showProfile);
                        setIsDropdownOpen(false);
                      }}
                      className="text-white md:text-2xl hover:text-green-400 hover:scale-105 px-1 md:px-2 rounded"
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
                        className="block px-4 py-2 text-md font-bold  text-center text-red-700 bg-gray-200"
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
                <button>Log-in</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
