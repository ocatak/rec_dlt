"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrganizationCard from "@/components/organizationCard";
import Image from "next/image";
import axios from "axios";
import { Notification } from "@/components/notifier";
import { useAuthenticatedContext } from "@/context/authentication";
import { useConnectionContext } from "@/context/connection";

interface ConnectedOrganization {
  name: string;
  email: string;
  endpoint: string;
  connectionId?: string;
}

export default function ExistingConnections() {
  const [selectedOrg, setSelectedOrg] = useState<ConnectedOrganization | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<ConnectedOrganization[]>(
    []
  );

  const router = useRouter();
  const { isAuthenticated } = useAuthenticatedContext();
  const { isConnected, setIsConnected } = useConnectionContext();

  const handleConfirmation = () => {
    if (selectedOrg) {
      localStorage.setItem("isConnected", "true");
      localStorage.setItem("selectedOrg", selectedOrg.name);
      localStorage.setItem("id", selectedOrg.connectionId!);
      setIsConnected(true);
      router.push('/')
    }
  };

  const connectionHandler = (organization: ConnectedOrganization) => {
    setSelectedOrg(organization);
  };

  useEffect(() => {
    const fetchConnectedOrganizations = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/agent/connected-organizations");
        const data = response.data;
        if (response.data.success && Array.isArray(data.response)) {
          setOrganizations(
            data.response.map((org: any) => ({
              name: org.organizationName,
              email: org.organizationEmail,
              endpoint: org.organizationAgentEndpoint,
              connectionId: org.connectionId,
            }))
          );
        } else {
          throw new Error("Data is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching connected organizations:", error);
        if (axios.isAxiosError(error)) {
          Notification({
            type: "error",
            title: "Failed to fetch connected organizations",
            text:
              error.response?.data?.message || "An unexpected error occurred.",
          });
        } else {
          Notification({
            type: "error",
            title: "Failed to fetch connected organizations",
            text: "An unexpected error occurred while fetching connected organizations.",
          });
        }
      }finally{
        setLoading(false)
      }
    };
    if (isAuthenticated) {
      fetchConnectedOrganizations();
    }
  }, [isAuthenticated]);

  return (
    <>
      {isAuthenticated && organizations.length > 0 ? (
        <section className="bg-gray-100 min-h-screen flex justify-center">
          <div className="container py-10 lg:py-20">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {organizations.length > 0 &&
                organizations.map((org, key) => (
                  <OrganizationCard
                    key={key}
                    organization={org}
                    connectionHandler={connectionHandler}
                  />
                ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {!isAuthenticated ? (
            <div className="flex justify-center items-center h-screen">
              <h1 className="text-2xl font-bold">
                Please login to view this page
              </h1>
            </div>
          ) : (
            <div className="flex justify-center items-center h-screen">
              <h1 className="text-2xl font-bold">
                You have no connected organizations
              </h1>
            </div>
          )}
        </>
      )}
      {selectedOrg && (
        <div className="flex justify-center mt-10">
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-40">
            <div className="bg-white rounded-lg p-12 shadow-lg w-[60%]">
              <h2 className="text-2xl font-bold mb-4">File transfer</h2>
              <p className="text-[20px] mb-4">
                You are trying to send file to{" "}
                <span className="font-bold text-[25px] text-green-600">
                  {selectedOrg.name} organization
                </span>
              </p>
              {!loading ? (
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={(e) => setSelectedOrg(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleConfirmation}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Image
                    src="loading.svg"
                    alt="loading..."
                    width={100}
                    height={100}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

