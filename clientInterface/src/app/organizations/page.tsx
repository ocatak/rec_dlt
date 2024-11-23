"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import OrganizationCard from "@/components/organizationCard";
import { Notification } from "@/components/notifier";
import axios from "axios";
import { useAuthenticatedContext } from "@/context/authentication";
import loader from "../../../public/loader.svg";
import { useConnectionContext } from "@/context/connection";
import Loading from "../loading";
interface Organization {
  name: string;
  email: string;
  endpoint: string;
  connectionId?: string;
}
interface Org {
  organizationName: string;
  organizationEmail: string;
  organizationAgentEndpoint: string;
  connectionId: string;
}
export default function AllOrganizations() {
  const [invitationUrl, setInvitation] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [displayOrganizations, setDisplayOrganizations] = useState<
    Organization[]
  >([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchInput, setSearchInput] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<
    "connected" | "not-connected" | null
  >(null);

  const router = useRouter();
  const { isAuthenticated } = useAuthenticatedContext();
  const { setIsConnected } = useConnectionContext();

  const ConfirmConnection = async () => {
    if (selectedOrg?.connectionId) {
      localStorage.setItem("isConnected", "true");
      localStorage.setItem("selectedOrg", selectedOrg.name);
      localStorage.setItem("id", selectedOrg.connectionId!);
      setIsConnected(true);
      router.push("/");
    } else {
      setLoading(true);
      try {
        if (!selectedOrg) {
          throw new Error("No organization selected");
        }

        const response = await axios.post("/api/agent/accept-invitation", {
          invitation: invitationUrl,
          agentEndpoint: localStorage.getItem("agentEndpoint"),
        });

        if (response.data.success) {
          setDisplayOrganizations(
            organizations.map((org: Organization) =>
              org.email === selectedOrg.email
                ? { ...org, connectionId: response.data.invitation.id }
                : org
            )
          );
          setIsConnected(true);
          localStorage.setItem("isConnected", "true");
          localStorage.setItem("selectedOrg", selectedOrg.name);
          localStorage.setItem("id", response.data.invitation.id);
          Notification({
            type: "success",
            title: "The connection has been established successfully.",
          });
          router.push("/");
        } else {
          throw new Error(
            response.data.message || "Failed to establish connection"
          );
        }
      } catch (error) {
        console.error("Error establishing connection:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNREFUSED") {
            Notification({
              type: "error",
              title: "Connection Error",
              text: "Unable to connect to the organization. Please check if the organization's endpoint is correct and accessible.",
            });
          } else {
            Notification({
              type: "error",
              title: "Failed to Establish Connection",
              text:
                error.response?.data?.message ||
                "An unexpected error occurred while establishing the connection.",
            });
          }
        } else {
          Notification({
            type: "error",
            title: "Failed to Establish Connection",
            text:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred while establishing the connection.",
          });
        }
      } finally {
        setLoading(false);
        setSelectedOrg(null);
      }
    }
  };

  const connectionHandler = async (organization: Organization) => {
    setSelectedOrg(organization);
    try {
      const response = await axios.post("/api/agent/create-invitation", {
        agentEndpoint: organization.endpoint,
      });

      if (response.data.success) {
        setInvitation(response.data.data.invitationUrl);
      } else {
        throw new Error(response.data.message || "Failed to create invitation");
      }
    } catch (error) {
      console.error("Error creating invitation:", error);
      if (axios.isAxiosError(error)) {
        Notification({
          type: "error",
          title: "Failed to Create Invitation",
          text:
            error.response?.data?.message ||
            "An unexpected error occurred while creating the invitation.",
        });
      } else {
        Notification({
          type: "error",
          title: "Failed to Create Invitation",
          text:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while creating the invitation.",
        });
      }
      setSelectedOrg(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/agent/organizations");
        const data = response.data.org;
        if (response.data.success && Array.isArray(data)) {
          setOrganizations(
            data.map((org: Org) => {
              return {
                name: org.organizationName,
                email: org.organizationEmail,
                endpoint: org.organizationAgentEndpoint,
                connectionId: org.connectionId,
              };
            })
          );
          setDisplayOrganizations(
            data.map((org: Org) => {
              return {
                name: org.organizationName,
                email: org.organizationEmail,
                endpoint: org.organizationAgentEndpoint,
                connectionId: org.connectionId,
              };
            })
          );
        } else {
          throw new Error("Data is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
        if (axios.isAxiosError(error)) {
          Notification({
            type: "error",
            title: "Failed to fetch connections",
            text:
              error.response?.data?.message || "An unexpected error occurred.",
          });
        } else {
          Notification({
            type: "error",
            title: "Failed to fetch connections",
            text: "An unexpected error occurred while fetching connections.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (filterType === "connected") {
      const filteredOrganizations = organizations.filter(
        (org) => org.connectionId
      );
      setDisplayOrganizations(filteredOrganizations);
    } else if (filterType === "not-connected") {
      const filteredOrganizations = organizations.filter(
        (org) => !org.connectionId
      );
      setDisplayOrganizations(filteredOrganizations);
    } else {
      setDisplayOrganizations(organizations);
    }
  }, [filterType]);

  useEffect(() => {
    if (searchInput) {
      const filteredOrganizations = organizations.filter((org) =>
        org.email.toLowerCase().includes(searchInput.toLowerCase())
      );
      setDisplayOrganizations(filteredOrganizations);
    } else {
      setDisplayOrganizations(organizations);
    }
  }, [searchInput]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {isAuthenticated && organizations.length > 0 ? (
        <>
          <div className="w-full bg-gray-100">
            <div className=" flex justify-end items-center p-6 space-x-6 rounded-xl mr-[12%]">
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn  py-3 px-4 rounded-md text-gray-600 font-bold cursor-pointer text-[16px]"
                >
                  <span>Filter</span>
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
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-md z-[1] w-52 p-2 shadow mt-2"
                >
                  <li onClick={() => setFilterType("connected")}>
                    <a className="text-[16px]">Connected</a>
                  </li>
                  <hr />
                  <li onClick={() => setFilterType("not-connected")}>
                    <a className="text-[16px]">Not connected</a>
                  </li>
                  <hr />
                  <li onClick={() => setFilterType(null)}>
                    <a className="text-[16px]">No filter</a>
                  </li>
                </ul>
              </div>
              <div className="flex bg-white p-4 space-x-4 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  className=" outline-none"
                  type="text"
                  placeholder="Search by email"
                  value={searchInput!}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="btn bg-gray-800 hover:bg-gray-900 py-3 px-5 text-white font-semibold rounded-lg hover:shadow-lg transition duration-300 cursor-pointer ">
                <span>Search</span>
              </div>
            </div>
          </div>
          <section className="bg-gray-100 min-h-screen flex justify-center">
            <div className="container py-10 lg:py-20">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
                {displayOrganizations!.length > 0 &&
                  displayOrganizations!.map((org, key) => (
                    <OrganizationCard
                      key={key}
                      organization={org}
                      connectionHandler={connectionHandler}
                    />
                  ))}
              </div>
            </div>
          </section>
        </>
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
                No organizations found in your network
              </h1>
            </div>
          )}
        </>
      )}
      {selectedOrg && (
        <div className="flex justify-center mt-10">
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-40">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              {selectedOrg.connectionId ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">File transfer</h2>
                  <p className="text-[20px] mb-4">
                    You are trying to send file to{" "}
                    <span className="font-bold text-[25px] text-green-600">
                      {selectedOrg.name} organization
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Agent connection</h2>
                  <p className="text-[20px] mb-4">
                    <span className="font-bold text-[25px] text-green-600">
                      {selectedOrg.name}
                    </span>{" "}
                    is trying to connect with your agent.
                  </p>
                </>
              )}
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
                    onClick={ConfirmConnection}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Image
                    src={loader}
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