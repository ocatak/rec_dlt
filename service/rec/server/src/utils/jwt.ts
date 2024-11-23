import jwt, { SignOptions } from 'jsonwebtoken';
import { _SERVER_CONFIG } from '../config/server';
import { ApiError } from './error';

export type ClientJwtPayload = {
    email: string;
    name: string;
    agentEndpoint: string;
}
export type JwtPayload = ClientJwtPayload

export function generateJwtToken(payload: any, expiresIn: string | number = '1h'): string {
    const options: SignOptions = {
        expiresIn,
    };

    const token = jwt.sign(payload, _SERVER_CONFIG.secret, options);
    const bearerToken = `Bearer ${token}`;
    return bearerToken;
}

export function verifyJwtToken<T extends JwtPayload>(token: string): jwt.JwtPayload & T {
    try {
        const jwtToken = extractToken(token);
        const decodedToken = jwt.verify(jwtToken, _SERVER_CONFIG.secret) as jwt.JwtPayload & T
        return decodedToken
    } catch (error) {
        throw new ApiError({
            message: 'Invalid token',
            status: 401
        });
    }
}

function extractToken(bearerToken: string): string {
    if (bearerToken.startsWith('Bearer ')) {
        return bearerToken.slice(7, bearerToken.length); // Remove 'Bearer ' prefix
    }
    throw new ApiError({
        message: 'Invalid token format',
        status: 401
    })
}
