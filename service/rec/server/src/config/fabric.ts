import { ApplicationGateway } from "../helper/fabric-gateway";
import { validateEnvVariable } from "../utils";

type FabricSetupConfig = {
    channelName: string,
    chaincodeName: string,
    mspId: string,
    cryptoPath: string,
    keyDirectoryPath: string,
    certDirectoryPath: string,
    tlsCertPath: string,
    peerEndpoint: string,
    peerHostAlias: string,
}

export const _FABRIC_CONFIG:FabricSetupConfig = {
    channelName: validateEnvVariable('CHANNEL_NAME'),
    chaincodeName: validateEnvVariable('CHAINCODE_NAME'),
    mspId: validateEnvVariable('MSP_ID'),
    cryptoPath: validateEnvVariable('CRYPTO_PATH'),
    keyDirectoryPath: validateEnvVariable('KEY_DIRECTORY_PATH'),
    certDirectoryPath: validateEnvVariable('CERT_DIRECTORY_PATH'),
    tlsCertPath: validateEnvVariable('TLS_CERT_PATH'),
    peerEndpoint: validateEnvVariable('PEER_ENDPOINT'),
    peerHostAlias: validateEnvVariable('PEER_HOST_ALIAS'),
} as const;

export const _applicationGateWay = new ApplicationGateway({
    chaincodeName: _FABRIC_CONFIG.chaincodeName,
    channelName: _FABRIC_CONFIG.channelName,
    mspId: _FABRIC_CONFIG.mspId,
    cryptoPath: _FABRIC_CONFIG.cryptoPath,
    keyDirectoryPath: _FABRIC_CONFIG.keyDirectoryPath,
    certDirectoryPath: _FABRIC_CONFIG.certDirectoryPath,
    tlsCertPath: _FABRIC_CONFIG.tlsCertPath,
    peerEndpoint: _FABRIC_CONFIG.peerEndpoint,
    peerHostAlias: _FABRIC_CONFIG.peerHostAlias,
})

