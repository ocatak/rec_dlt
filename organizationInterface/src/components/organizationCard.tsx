import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const pathName = usePathname();
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
          <h3 className="mb-4 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">
            {organization.name.split('@')[0].toLocaleUpperCase()}
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
            <button
              className="inline-block rounded-full border border-gray-3 px-7 py-2 text-base font-medium text-body-color transition hover:border-primary hover:bg-[green] hover:text-white "
              onClick={() => connectionHandler(organization)}
            >
              See clients
            </button>
          )}
        </div>
      </div>
      {/*  */}
    </>
  );
};

export default OrganizationCard;
