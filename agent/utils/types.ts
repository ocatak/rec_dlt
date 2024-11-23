import { OutOfBandInvitation } from "@aries-framework/core"

export interface ErrorResponse {
    status: StatusTypes.error
    message: string
}

export interface SuccessResponse<T> {
    status: StatusTypes.success,
    data: T
}

export enum RegistryOptions {
    indy = 'indy',
    cheqd = 'cheqd',
}

export enum StatusTypes {
    success = 'success',
    error = 'error'
}

export interface CustomInvitationRespone {
    invitationUrl: string,
    invitationJson: OutOfBandInvitation
    oobId: string
}

export type OrganizationConnectionPayload = {
    organizationEmail: string,
    connectionId: string,
    clientEmail: string,
    clientName: string,
    clientAgentEndpoint: string
    type: "client" | "organization"
}