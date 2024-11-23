export function validateEnvVariable(varName: string): string {
    const value = process.env[varName];
    if (value === undefined || value === null) {
        throw new Error(`Environment variable ${varName} is not defined.`);
    }
    return value;
}