import { useSidebarContext } from "@/context/sidebar";
import { useEffect, useState } from "react";
import refresh from "../../public/refresh.gif";
import staticRefresh from "../../public/static-refresh.png";
import axios from "axios";
import { Notification } from "./notifier";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/lib/cookieHandler";
import { useAuthenticatedContext } from "@/context/authentication";
import Loading from "@/app/loading";

interface SidebarProps {
  setMsg: (
    callback: () => {
      timeStamp: Date[];
      produced: number[];
      forcasted: number[];
    }
  ) => void;
  setUser: (user: {
    name: string;
    email: string;
    connectionId: string;
  }) => void;
  name: string;
  email: string;
}

interface Client {
  name: string;
  email: string;
  connectionId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ setMsg, setUser, name, email }) => {
  const [reload, setReload] = useState<boolean>(false);
  const [connectedClients, setConnectedClients] = useState<Client[]>([]);
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(
    null
  );
  const [selectedOrgEmail, setSelectedOrgEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<Boolean>(false);

  const { open } = useSidebarContext();
  const { setIsAuthenticated } = useAuthenticatedContext();
  const router = useRouter();
  const getData = async (connectionId: string) => {
    try {
      const response = !selectedOrgEmail
        ? await axios.get(`/api/agent/files-data/${connectionId}`)
        : await axios.post(`/api/agent/files-data/`, {
            connectedOrganizationId: selectedOrgEmail,
            connectionId,
          });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching data for this client:", error);
      if (axios.isAxiosError(error)) {
        Notification({
          type: "error",
          title: "Failed to fetch data for this client",
          text:
            error.response?.data?.message || "An unexpected error occurred.",
        });
      } else {
        Notification({
          type: "error",
          title: "Failed to fetch data for this client",
          text: "An unexpected error occurred while fetching data for this client.",
        });
      }
    }
  };

  const clickHandler = async (client: Client) => {
    setSelectedClientEmail(client.name);
    setUser({
      name: client.name || "",
      email: client.email || "",
      connectionId: client.connectionId || "",
    });
    try {
      const res = await getData(client.connectionId);
      const chartData = res.results;
      if (res.isEmpty) {
        setMsg(() => {
          return {
            timeStamp: [],
            produced: [],
            forcasted: [],
          };
        });
      } else {
        setMsg(() => {
          const x1 = [
            ...chartData.map((item: any) => new Date(item.timestamp)),
          ];
          const y1 = [...chartData.map((item: any) => item.production)];
          const z1 = [...chartData.map((item: any) => item.forcasted)];

          return {
            timeStamp: x1,
            produced: y1,
            forcasted: z1,
          };
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const reloadHandler = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!name || !email) await getConnectedClients();
      else await getConnectedOrgCLients(selectedOrgEmail!);
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedClientEmail(null);
      setReload(false);
    }
  };

  const getConnectedOrgCLients = async (email: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/agent/connected-org-clients/${email}`
      );
      setConnectedClients(
        response.data.response.map((client: any) => ({
          name: client.clientName,
          email: client.clientEmail,
          connectionId: client.connectionId,
        }))
      );
    } catch (error) {
      console.error("Error fetching connected clients:", error);
      if (axios.isAxiosError(error)) {
        Notification({
          type: "error",
          title: "Failed to fetch connected clients",
          text:
            error.response?.data?.message || "An unexpected error occurred.",
        });
      } else {
        Notification({
          type: "error",
          title: "Failed to fetch connected clients",
          text: "An unexpected error occurred while fetching connected clients.",
        });
      }
      deleteCookie();
      localStorage.clear();
      setIsAuthenticated(false);
      router.push("/log-in");
    } finally {
      setLoading(false);
    }
  };

  const getConnectedClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/agent/connected-clients");
      setConnectedClients(
        response.data.response.map((client: any) => ({
          name: client.clientName,
          email: client.clientEmail,
          connectionId: client.connectionId,
        }))
      );
    } catch (error) {
      console.error("Error fetching connected clients:", error);
      if (axios.isAxiosError(error)) {
        Notification({
          type: "error",
          title: "Failed to fetch connected clients",
          text:
            error.response?.data?.message || "An unexpected error occurred.",
        });
      } else {
        Notification({
          type: "error",
          title: "Failed to fetch connected clients",
          text: "An unexpected error occurred while fetching connected clients.",
        });
      }
      deleteCookie();
      localStorage.clear();
      setIsAuthenticated(false);
      router.push("/log-in");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name === "" && email === "") {
      getConnectedClients();
    } else {
      setSelectedOrgEmail(email);
      getConnectedOrgCLients(email);
    }
  }, [email]);

  if (loading && !reload) {
    return <Loading />;
  }

  return (
    <div className="relative lg:relative-auto">
      {open && (
        <aside className="sidebar absolute top-0 left-0 lg:relative w-[260px] lg:w-[300px] h-full transform bg-white p-4 transition-transform duration-150 ease-in lg:translate-x-0 overflow-y-auto z-10 lg:z-0">
          <div className="my-4 w-full border-b-4 border-indigo-100 text-center">
            <div className="font-mono text-xl font-bold tracking-widest  text-[16px] xl:text-[20px]">
              {" "}
              {name ? (
                <p className="mb-0">
                  {decodeURIComponent(
                    name.split("@")[0].replace(".", " ").toUpperCase()
                  ).substring(0, 10) +
                    decodeURIComponent(
                      name.split("@")[0].length > 10 ? "..." : ""
                    )}
                </p>
              ) : (
                <span>Your</span>
              )}
              <span className="text-indigo-600">Client</span>List{" "}
              <button>
                <img
                  src={reload ? refresh.src : staticRefresh.src}
                  alt="refresh"
                  height={40}
                  width={40}
                  onClick={(e) => {
                    setReload(true);
                    reloadHandler();
                  }}
                  className="inline-block pl-4"
                />
              </button>
            </div>
          </div>
          {connectedClients.length > 0 && (
            <div>
              {connectedClients.map((client, index) => (
                <div
                  key={index}
                  className={`group ${
                    client.email === selectedClientEmail
                      ? "bg-indigo-600"
                      : "bg-gray-100 hover:bg-indigo-600"
                  } my-3 py-2 px-3 cursor-pointer rounded-md border border-gray-300 transition-colors duration-300  `}
                  onClick={(e) => clickHandler(client)}
                >
                  <h3
                    className={`text-lg font-semibold ${
                      client.email === selectedClientEmail
                        ? "text-white"
                        : "text-black group-hover:text-white"
                    }`}
                  >
                    {client.name.split("@")[0].replace(".", " ").toUpperCase()}
                  </h3>
                  <p
                    className={` ${
                      client.email === selectedClientEmail
                        ? "text-white"
                        : "text-gray-600 group-hover:text-white "
                    }
                            max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg truncate`}
                  >
                    {client.email}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="my-4"></div>
        </aside>
      )}
    </div>
  );
};

export default Sidebar;
