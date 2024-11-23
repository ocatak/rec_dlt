"use client";
import React, { useState, useRef } from "react";
import Toaster from "./Toaster";
import Image from "next/image";
import axios from "axios";
import { Notification } from "./notifier";

export default function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState<string>();
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>();
  const [fileName, setFileName] = useState<string>();

  const readFile = (selectedFile: Blob) => {
    setFileName(selectedFile.name);
    const reader = new FileReader();

    reader.onload = function (e) {
      const csvContent = e.target?.result;
      parseCsv(csvContent as string);
    };

    reader.readAsText(selectedFile);
  };

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      readFile(selectedFile);
    }
  };
  function parseCsv(csvData: string) {
    setFileContent(csvData);
  }

  const fileHandler = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/agent/file-upload", {
        agentEndpoint: localStorage.getItem("agentEndpoint"),
        csvData: fileContent,
        connectionId: localStorage.getItem("id"),
        email: localStorage.getItem("selectedOrg"),
      });

      Notification({
        type: "success",
        title: "This file has been sent successfully.",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 413) {
            Notification({
              type: "error",
              title: "File Too Large",
              text: "The file you're trying to upload is too large.",
            });
          } else {
            Notification({
              type: "error",
              title: "Failed to send file",
              text:
                error.response.data?.message ||
                "An unexpected error occurred while sending the file.",
            });
          }
        } else if (error.request) {
          Notification({
            type: "error",
            title: "Network Error",
            text: "Unable to reach the server. Please check your internet connection.",
          });
        } else {
          Notification({
            type: "error",
            title: "Error",
            text:
              error.message ||
              "An unexpected error occurred while sending the file.",
          });
        }
      } else {
        Notification({
          type: "error",
          title: "Failed to send file",
          text: "An unexpected error occurred while sending the file.",
        });
      }
    } finally {
      setLoading(false);
      setFileName("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const droppedFiles = Array.from(e.dataTransfer.files);

      readFile(droppedFiles[0]);
    } catch (error) {
      Notification({
        type: "error",
        title: "Drag and Drop Issue",
        text: "An unexpected error occurred while selecting the file.",
      });
    }
  };

  return (
    <>
      {!loading ? (
        <div>
          <div
            className="flex items-center justify-center w-full"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => handleDrop(e)}
          >
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                {fileName ? (
                  <p className="mb-2 text-lg font-semibold text-green-500 dark:text-green-400">
                    File has been selected
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      supports csv data
                    </p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>
          {fileName && (
            <>
              <p className="my-5 text-[20px] font-bold">File Name: {fileName}</p>
              <button
                onClick={fileHandler}
                className="bg-blue-300 px-5 py-2 rounded-[10px] mt-5 font-bold"
              >
                Send <img src="/sendBtn.svg" alt="My Icon" className="w-6 h-6 ml-2 inline-block" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex justify-center ">
          <Image src="loading.svg" alt="loading..." width={100} height={100} />
          {/* <div>Sending message...</div> */}
        </div>
      )}
      <div>
        {showToaster && (
          <Toaster message="Record is being updated in background via SSI channel" />
        )}
      </div>
    </>
  );
}
