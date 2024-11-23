
export type ClientRegistrationData = {
    name: string;
    email: string;
    agentEndpoint: string;
    password: string;
    docType: ClientDataDocType.ClientRegistrationData;
}
export type ClientConnectionData = {
    clientEmail: string;
    docType: ClientDataDocType.ClientConnectionData;
}

export type OrganizationConnectionData = {
    connections: OrganizationConnectionRecord[]
    organizationEmail: string;
    docType: OrganizationDataDocType.OrganizationConnectionData;
}
export type ClientConnectionRecord = {
    organizationName: string;
    organizationEmail: string;
    organizationAgentEndpoint: string;
    connectionId: string;
}

export type OrganizationConnectionRecord = {
    clientName: string;
    clientEmail: string;
    clientAgentEndpoint: string;
    connectionId: string;
    type: "client" | "organization";
}

export type ClientData = ClientConnectionData | ClientRegistrationData;
export enum ClientDataDocType {
    ClientRegistrationData = 'client-registration-data',
    ClientConnectionData = 'client-connection-data'
}
export type ClientPublicData = {
    clientName: string;
    clientEmail: string;
    clientAgentEndpoint: string;
}

export enum OrganizationDataDocType {
    OrganizationRegistrationData = 'organization-registration-data',
    OrganizationConnectionData = 'organization-connection-data',
    RecRawData = 'raw_data',
    RecSortData = 'sort_data'
}

export type ClientRegistrationRecord = ClientRegistrationData
export type UpdateClientConnectionList = ClientConnectionRecord & { clientEmail: string }
export type ClientConnectionsReponse = {
    clientEmail: string,
    connections: ClientConnectionRecord[],
    docType: ClientDataDocType.ClientConnectionData
}
export type OrganizationData = {
    organizationName: string;
    organizationEmail: string;
    organizationAgentEndpoint: string;
}

export type OrganizationRegistrationData = {
    organizationName: string,
    organizationEmail: string,
    organizationAgentEndpoint: string,
    password: string
    docType: OrganizationDataDocType.OrganizationRegistrationData
}

export type ClientConnectionUpdatePayload = {
    clientEmail: string,
    connectionId: string,
    organizationEmail: string,
    organizationName: string,
    organizationAgentEndpoint: string
}

export type OrganizationConnectionUpdatePayload = {
    organizationEmail: string,
    connectionId: string,
    clientEmail: string,
    clientName: string,
    clientAgentEndpoint: string
    type: "client" | "organization"
}