import Image from "next/image";
import { Notification } from "./notifier";
interface Organization {
  name: string;
  email: string;
  endpoint: string;
  connectionId?: string;
}
interface OrganizationCardProps {
  organization: Organization;
  connectionHandler: (organization: Organization) => void;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  connectionHandler,
}) => {
  const copyToClipboard = async (organization: Organization) => {
    if (organization.connectionId) {
      try {
        await navigator.clipboard.writeText(organization.connectionId);
        Notification({type: 'success',title: "Connection ID copied to clipboard"});
      } catch (error) {
        console.error("Failed to copy text: ", error);
      }
    }
  };
  return (
    <>
      {/*  */}
      <div className="relative overflow-hidden rounded-lg bg-white shadow-1 duration-300 hover:shadow-3 dark:bg-dark-2 dark:shadow-card dark:hover:shadow-3">
        {organization.connectionId ? (
          <div className="absolute top-2 right-2">
            <Image
              src="/connected.svg"
              alt="connected"
              width={16}
              height={16}
            />
          </div>
        ) : (
          <div className="absolute top-2 right-2">
            <Image
              src="/notConnected.svg"
              alt="connected"
              width={16}
              height={16}
            />
          </div>
        )}
        <div className="p-8 text-center sm:p-9 md:p-7 xl:p-9">
          <h3 className="mb-2 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">
            {organization.name.split("@")[0].toLocaleUpperCase()}
          </h3>
          <p className="mb-7 text-base leading-relaxed text-body-color dark:text-dark-6">
            {organization.email}
          </p>
          
          {!organization.connectionId ? (
            <button
              className="inline-block rounded-full border border-gray-3 px-7 py-2 text-base font-medium text-body-color transition hover:border-primary hover:bg-[green] hover:text-white "
              onClick={() => connectionHandler(organization)}
            >
              Establish Connection
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                className="inline-block w-[120px] mx-auto rounded-full border border-gray-3 px-5 py-2 text-base font-medium text-body-color transition hover:border-primary hover:bg-[green] hover:text-white "
                onClick={() => connectionHandler(organization)}
              >
                Send file
              </button>
              <button
                className="inline-block rounded-full border border-gray-3 px-5 py-2 text-base font-medium text-body-color transition hover:bg-[gray] hover:text-white "
                onClick={() => copyToClipboard(organization)}
              >
                Copy Connection Id
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrganizationCard;
