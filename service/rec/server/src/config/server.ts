// import Redis from "ioredis";
import { validateEnvVariable } from "../utils";

type ServerSetupConfig = {
    port: number,
    secret: string,
    // host: string
}
export const _SERVER_CONFIG: ServerSetupConfig = {
    port: parseInt(validateEnvVariable('PORT')),
    secret: validateEnvVariable('SECRET'),
} as const;
