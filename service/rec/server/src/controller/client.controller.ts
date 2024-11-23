import { _applicationGateWay } from "../config/fabric";
import RedisSingleton from "../helper/cache";
import { ClientDataDocType, ClientRegistrationData, UpdateClientConnectionList } from "../helper/types";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { ApiError, apiErrorHandler } from "../utils/error";
import { generateJwtToken } from "../utils/jwt";
import { requestBodyAttributeValidator, requestParamValidator } from "../utils/validator";
import { Request, Response } from 'express';
export class ClientController {
    private constructor() { }
    public static async register(req: Request, res: Response) {
        try {
            const name = requestBodyAttributeValidator(req, 'name');
            const email = requestBodyAttributeValidator(req, 'email');
            const agentEndpoint = requestBodyAttributeValidator(req, 'agentEndpoint');
            const password = requestBodyAttributeValidator(req, 'password');
            const hashedPassword = await hashPassword(password);
            // check if email already exists as id
            const existingData = await _applicationGateWay.retrieveData<ClientRegistrationData>(email, ClientDataDocType.ClientRegistrationData);
            if (existingData) {
                throw new ApiError({
                    message: 'Client already exists',
                    status: 409
                })
            }
            const clientData: ClientRegistrationData = {
                name,
                email,
                agentEndpoint,
                password: hashedPassword,
                docType: ClientDataDocType.ClientRegistrationData
            }
            console.log(clientData)
            await _applicationGateWay.addClientRegistrationData(clientData);
            res.status(201).send({
                success: true
            });
        } catch (error) {
            apiErrorHandler(error, res);
        }
    }
    public static async login(req: Request, res: Response) {
        try {
            const email = requestBodyAttributeValidator(req, 'email');
            const password = requestBodyAttributeValidator(req, 'password');
            const clientData = await _applicationGateWay.retrieveData<ClientRegistrationData>(email, ClientDataDocType.ClientRegistrationData);
            console.log(clientData)
            if (!clientData) {
                throw new ApiError({
                    message: 'Invalid email or password',
                    status: 404
                })
            }
            const isMatch = await comparePassword(password, clientData.password);
            if (!isMatch) {
                throw new ApiError({
                    message: 'Invalid email or password',
                    status: 401
                })
            }
            // generate jwt token   
            const token = generateJwtToken({
                email: clientData.email,
                name: clientData.name,
                agentEndpoint: clientData.agentEndpoint
            })
            res.header('Authorization', token);
            res.status(200).send({
                success: true,
                clientData: {
                    email: clientData.email,
                    name: clientData.name,
                    agentEndpoint: clientData.agentEndpoint
                }
            });
        } catch (error) {
            console.log(error)
            apiErrorHandler(error, res);
        }
    }
    // this will be called by the subscriber to add the connection data 
    public static async addConnectionData(data: UpdateClientConnectionList) {
        try {
            await _applicationGateWay.addClientConnectionData(data);
            // del cache so that next time it will be fetched from the ledger
            //TODO: check 
            await RedisSingleton.getInstance().del(`cl_${data.clientEmail}`);
        } catch (e) {
            // throw e;
            console.error(e)
        }
    }
    public static async getConnectionData(req: Request, res: Response) {
        try {
            // @ts-ignore
            const email = req.verifiedInfo.email
            const data = await _applicationGateWay.getClientConnectionList(email);
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
    public static async getPublicData(req: Request, res: Response) {
        try {
            const clientId = requestParamValidator(req, 'clientId');
            // check if data is in cache
            // const cachedData = await RedisSingleton.getInstance().get<{
            //     name: string,
            //     email: string,
            //     agentEndpoint: string
            // }>(clientId);
            // if(cachedData){
            //     return res.status(200).send({
            //         clientName: cachedData.name,
            //         clientEmail: cachedData.email,
            //         clientAgentEndpoint: cachedData.agentEndpoint
            //     });
            // }
            const clientData = await _applicationGateWay.retrieveData<ClientRegistrationData>(clientId, ClientDataDocType.ClientRegistrationData);
            if (!clientData) {
                throw new ApiError({
                    message: 'Client not found',
                    status: 404
                })
            }
            // cache data for 1 day
            // await RedisSingleton.getInstance().set(clientId, {
            //     name: clientData.name,
            //     email: clientData.email,
            //     agentEndpoint: clientData.agentEndpoint
            // }, 86400);
            res.status(200).send({
                clientName: clientData.name,
                clientEmail: clientData.email,
                clientAgentEndpoint: clientData.agentEndpoint
            });
        } catch (error) {
            return apiErrorHandler(error, res);
        }

    }

}
