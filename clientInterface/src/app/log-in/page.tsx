"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import showPasswordIcon from "../../../public/showPassword.svg";
import hidePasswordIcon from "../../../public/hidePassword.svg";
import axios from "axios";
import Image from "next/image";
import { Notification } from "@/components/notifier";
import { useRouter } from "next/navigation";
import { useAuthenticatedContext } from "@/context/authentication";

function LogIn() {
  const { setIsAuthenticated } = useAuthenticatedContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [disableLoginBtn, setDisableLoginBtn] = useState<boolean>(false);
  const router = useRouter();
  function isValidEmail(email: string): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
    return pattern.test(email);
  }
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const formHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDisableLoginBtn(true);

    if (!isValidEmail(email)) {
      setEmailError(true);
    } else {
      try {
        const response = await axios.post('/api/agent/login', {
          email,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        localStorage.setItem('agentEndpoint', response.data.clientData.agentEndpoint);
        localStorage.setItem('name', response.data.clientData.name);
        localStorage.setItem('email', response.data.clientData.email);
        if(response.data.success){
          setIsAuthenticated(true);
          Notification({ title: "Login successful", type: "success", text: "You have successfully logged in." });
          router.push('/')
        }else{
          Notification({ title: "Login failed", type: "error", text: response.data.message });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Login failed:', error.response?.data?.message || 'An error occurred');
          Notification({ title: "Login failed", type: "error", text: error.response?.data?.message ||"Please check your email and password and try again." });
        } else {
          console.error('Error during login:', error);
          Notification({ title: "Login failed", type: "error", text: "An error occurred during login." });
        }
      }
      setDisableLoginBtn(false);
    }
  };
  
  return (
    <div className="flex justify-center mt-10">
      <form onSubmit={formHandler} className="bg-gray-700 shadow-md rounded px-8 pt-6 pb-3 mb-4 max-w-[650px] w-full mx-5">
        <div className="mb-4">
          <label className="block text-white text-[20px] font-bold mb-2">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="text"
            placeholder="Email"
            onChange={(e) => {setEmail(e.target.value)}}
          />
          {emailError && (
            <p className="text-red-400 text-[15px] italic">
              **Please enter correct email
            </p>
          )}
        </div>
        <div className="mb-4 relative">
          <label className="block text-white text-[20px] font-bold mb-2">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            className="absolute inset-y-0 right-0 pt-10 pr-3 flex items-center text-sm leading-5 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            <Image
              src={!showPassword ? hidePasswordIcon : showPasswordIcon}
              alt="passwordShowOrHide"
              width={20}
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link
            className="text-white font-bold py-2 pr-4 rounded hover:text-blue-400 focus:outline-none focus:shadow-outline"
            href="/sign-up"
          >
            Do not have an account?
          </Link>
          {disableLoginBtn ? (
            <button className="btn btn-info text-white">
              <span className="loading loading-spinner inline-block"></span> 
              Loading
            </button>
          ) : (
            <button
              className={` btn btn-accent btn-outline ${
                disableLoginBtn
                  && "cursor-not-allowed bg-blue-200 "
                  
              }`}
              disabled={disableLoginBtn}
              type="submit"
            >
              <span className="text-[20px]">Log in</span>
              
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default LogIn;
