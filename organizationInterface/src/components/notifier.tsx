import React from "react";
import { ToastOptions, toast } from "react-toastify";

export const Notification = ({
  type,
  title,
  text,
  time = 4000

}: {
  type: "info"| "success"| "error"| "warning";
  title: string;
  text?: string;
  time?: number
}) => {

  const toastProps = {
    position: "top-center",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  const Message = () => (
    <div className="msg-container w-full mx-auto rounded-lg">
    <p className="msg-title text-lg font-semibold text-blue-800 mb-2">{title}</p>
    <p className="msg-description text-base text-blue-700">{text}</p>
  </div>
  );
  toast.dismiss()
  if (type === "success") {
    toast.success(<Message />, toastProps as ToastOptions);
  }else if (type === "error") {
    toast.error(<Message />, toastProps as ToastOptions);
  }else if (type === 'info'){
    toast.info(<Message/>, toastProps as ToastOptions)
  }else if (type === 'warning'){
    toast.warning(<Message/>, toastProps as ToastOptions)
  }
};