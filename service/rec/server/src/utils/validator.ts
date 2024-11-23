import { ApiError } from "./error";
import { Request } from "express";
export function requestBodyAttributeValidator(req: Request, key: string) {
    if (!req.body[key]) {
        throw new ApiError({
            message: `attribute ${key} is missing`,
            status: 400
        });
    }
    return req.body[key];
}

export function validateObject(obj: any, key: string) {
    if (!obj[key]) {
        throw new Error(`attribute ${key} is missing`);
    }
    return obj[key];
}

export function requestParamValidator(req: Request, key: string):string {
    if (!req.params[key]) {
        throw new ApiError({
            message: `attribute ${key} is missing`,
            status: 400
        });
    }
    return req.params[key] as string;
}