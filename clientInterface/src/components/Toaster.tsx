import React, { useState, useEffect } from 'react';

interface ToasterProps {
  message: string;
}

const Toaster: React.FC<ToasterProps> = ({ message }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // After 3 seconds, hide the toaster
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    // Clear the timer when the component unmounts or when the message changes
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className={`w-[400px] mx-auto fixed top-0 left-0 right-0 flex justify-center items-center h-16 bg-blue-500 text-white px-4 py-2 rounded-md transition-opacity opacity-100`}>
    {message}
    </div>
  );
};

export default Toaster;
