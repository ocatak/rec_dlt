import { ApiError, apiErrorHandler } from "../utils/error";
import { verifyJwtToken } from "../utils/jwt";
import { Request, Response, NextFunction } from 'express';

export function clientAuthorization() {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.header('Authorization');
            console.log("token",token)
            if (!token) {
                throw new ApiError({
                    message: 'Unauthorized',
                    status: 401
                })
            }
            const decoded = verifyJwtToken(token);
            console.log(decoded)
            // @ts-ignore
            req.verifiedInfo = {
                email: decoded.email,
                name: decoded.name,
                agentEndpoint: decoded.agentEndpoint
            }
            next();
        } catch (error) {
            apiErrorHandler(error, res);
        }
    }
}