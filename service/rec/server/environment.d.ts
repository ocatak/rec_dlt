declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CHANNEL_NAME: string;
            CHAINCODE_NAME: string;
            MSP_ID: string;
            CRYPTO_PATH: string;
            KEY_DIRECTORY_PATH: string;
            CERT_DIRECTORY_PATH: string;
            TLS_CERT_PATH: string;
            PEER_ENDPOINT: string;
            PEER_HOST_ALIAS: string;
            SECRET: string;
            PORT: string;
        }
    }
}
// This empty export statement makes sure that TypeScript treats this file as a module
export { }