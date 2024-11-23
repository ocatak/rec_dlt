import { Response } from 'express';
export class ApiError extends Error {
    public status: number;
    constructor({ status, message }: { status: number, message: string }) {
        super(message);
        this.status = status;
    }
}

export function apiErrorHandler(err: any, res: Response) {
    if (err instanceof ApiError) {
        res.status(err.status).send({
            message: err.message,
            success: false
        });
    } else {
        res.status(500).send({
            message: 'Internal Server Error',
            success: false
        });
    }
}