import { _applicationGateWay } from "../config/fabric";
import { Request, Response } from "express";
import { requestBodyAttributeValidator, requestParamValidator } from "../utils/validator";
import { OrganizationConnectionUpdatePayload, OrganizationData, OrganizationDataDocType, OrganizationRegistrationData, } from "../helper/types";
import { ApiError, apiErrorHandler } from "../utils/error";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { generateJwtToken } from "../utils/jwt";
export class OrganizationController {
    private constructor() { }

    public static async register(req: Request, res: Response) {
        try {
            const name = requestBodyAttributeValidator(req, 'name');
            const email = requestBodyAttributeValidator(req, 'email');
            const agentEndpoint = requestBodyAttributeValidator(req, 'agentEndpoint');
            const password = requestBodyAttributeValidator(req, 'password');
            const hashedPassword = await hashPassword(password);
            // check if email already exists as id
            const existingData = await _applicationGateWay.retrieveData<OrganizationRegistrationData>(email, OrganizationDataDocType.OrganizationRegistrationData);
            console.log(existingData)
            if (existingData) {
                throw new ApiError({
                    message: 'Organization already exists',
                    status: 409
                })
            }

            const data: OrganizationRegistrationData = {
                organizationAgentEndpoint: agentEndpoint,
                organizationName: name,
                organizationEmail: email,
                password: hashedPassword,
                docType: OrganizationDataDocType.OrganizationRegistrationData
            }
            await _applicationGateWay.addOrganizationRegistrationData(data);
            res.status(201).send({
                success: true
            });
        } catch (e) {
            apiErrorHandler(e, res);

        }
    }
    public static async login(req: Request, res: Response) {
        try {
            const email = requestBodyAttributeValidator(req, 'email');
            const password = requestBodyAttributeValidator(req, 'password');
            const orgData = await _applicationGateWay.retrieveData<OrganizationRegistrationData>(email, OrganizationDataDocType.OrganizationRegistrationData);
            if (!orgData) {
                throw new ApiError({
                    message: 'Invalid email or password',
                    status: 404
                })
            }
            const isMatch = await comparePassword(password, orgData.password);
            if (!isMatch) {
                throw new ApiError({
                    message: 'Invalid email or password',
                    status: 401
                })
            }
            // generate jwt token   
            const token = generateJwtToken({
                email: orgData.organizationEmail,
                name: orgData.organizationName,
                agentEndpoint: orgData.organizationAgentEndpoint
            })
            res.header('Authorization', token);
            res.status(200).send({
                success: true,
                orgData: {
                    email: orgData.organizationEmail,
                    name: orgData.organizationName,
                    agentEndpoint: orgData.organizationAgentEndpoint
                }
            });
        } catch (error) {
            console.log(error)
            apiErrorHandler(error, res);
        }
    }
    public static async getPublicData(req: Request, res: Response) {
        try {
            const organizationId = requestParamValidator(req, 'organizationId');
            // check from cache 
            // const cachedData = await RedisSingleton.getInstance().get<{
            //     organizationName: string,
            //     organizationEmail: string,
            //     organizationAgentEndpoint: string
            // }>(organizationId);
            // // if data found in cache return it
            // if (cachedData) {
            //     return res.status(200).send({
            //         organizationName: cachedData.organizationName,
            //         organizationEmail: cachedData.organizationEmail,
            //         organizationAgentEndpoint: cachedData.organizationAgentEndpoint
            //     });
            // }
            const organizationData = await _applicationGateWay.retrieveData<OrganizationData>(organizationId, OrganizationDataDocType.OrganizationRegistrationData);
            console.log("org data", organizationData)
            if (!organizationData) {
                throw new ApiError({
                    message: 'Organization not found',
                    status: 404
                })
            }
            // cache data for 1 day
            // await RedisSingleton.getInstance().set(organizationId, {
            //     organizationName: organizationData.organizationName,
            //     organizationEmail: organizationData.organizationEmail,
            //     organizationAgentEndpoint: organizationData.organizationAgentEndpoint
            // }, 86400);

            res.status(200).send({
                organizationName: organizationData.organizationName,
                organizationEmail: organizationData.organizationEmail,
                organizationAgentEndpoint: organizationData.organizationAgentEndpoint
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
    // this will be called by the subscriber to add the connection data 
    public static async addConnectionData(data: OrganizationConnectionUpdatePayload) {
        try {
            await _applicationGateWay.addOrganizationConnectionData(data);
        } catch (e) {
            // throw e;
            console.error(e)
        }
    }
    public static async getClientConnectionData(req: Request, res: Response) {
        try {
            // const organizationId = requestParamValidator(req, 'organizationId');
            // @ts-ignore
            const email = req.verifiedInfo.email
            const data = await _applicationGateWay.getOrganizationClientConnectionList(email);
            // if no data found return empty array
            if (!data) {
                return res.status(200).send({
                    success: true,
                    response: []
                })
            }
            return res.status(200).send({
                success: true,
                response: data
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
    public static async getOrganizationConnectionData(req: Request, res: Response) {
        try {
            // const organizationId = requestParamValidator(req, 'organizationId');
            // @ts-ignore
            const email = req.verifiedInfo.email
            console.log("email in fabric", email)
            const data = await _applicationGateWay.getOrganizationOrganizationConnectionList(email);
            // if no data found return empty array
            if (!data) {
                return res.status(200).send({
                    success: true,
                    response: []
                })
            }
            return res.status(200).send({
                success: true,
                response: data
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
    public static async getConnectedOrganizationClients(req: Request<{ connectedOrganizationId: string }>, res: Response) {
        try {
            // @ts-ignore
            const organizationId = req.verifiedInfo.email
            const connectedOrganizationId = requestParamValidator(req, 'connectedOrganizationId');

            // check if organization is connected and retrive data
            const data = await _applicationGateWay.getConnectedOrganizationClients({ organizationId, connectedOrganizationId });
            return res.status(200).send({
                success: true,
                response: data
            })

        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
    public static async retrieveConnectionOrganizationSpecificClientData(req:Request, res:Response){
        try{
            // @ts-ignore
            const organizationId = req.verifiedInfo.email
            const {connectedOrganizationId, connectionId} = req.body
            console.log("retrieveConnectionOrganizationSpecificClientData",connectedOrganizationId, connectionId)
            const data = await _applicationGateWay.getConnectedOrganizationSpecificClientData({connectedOrganizationId, connectionId, organizationId})
            console.log(data)
            return res.status(200).send({
                success: true,
                response: data
            })

        }catch(error){
            return apiErrorHandler(error, res);
        }
    }

    public static async retriveAllOrgPublicData(req: Request, res: Response) {
        try {
            const data = await _applicationGateWay.getAllOrganizationData();
            console.log(data)
            return res.status(200).send({
                success: true,
                response: data
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
    public static async storeSingleProcessData(message: any) {
        try {
            await _applicationGateWay.handleSingleData(message);
        } catch (error) {
            // throw error;
            console.error(error)
        }
    }
    public static async storeBulkProcessData(message: any) {
        try {
            await _applicationGateWay.handleBulkData(message);
        } catch (error) {
            // throw error;
            console.error(error)
        }
    }
    // todo: testing
    public static async getRealtimeData(req: Request<{ connectionId: string }>, res: Response) {
        try {
            const connectionId = requestParamValidator(req, 'connectionId');
            if (!connectionId) {
                throw new ApiError({
                    message: 'Invalid connectionId',
                    status: 400
                })
            }
            const data = await _applicationGateWay.getRealtimeData(connectionId)
            return res.status(200).send({
                success: true,
                response: data
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
    public static async getSortedData(req: Request<{ connectionId: string }>, res: Response) {
        try {
            const connectionId = requestParamValidator(req, 'connectionId');
            // @ts-ignore
            const organizationId = req.verifiedInfo?.email
            if (!connectionId) {
                throw new ApiError({
                    message: 'Invalid connectionId',
                    status: 400
                })
            }

            const data = await _applicationGateWay.getSortedData({ connectionId, organizationId })
            return res.status(200).send({
                success: true,
                response: data
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }
    }
}