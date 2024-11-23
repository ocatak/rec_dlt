/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import * as grpc from "@grpc/grpc-js";
import {
  connect,
  Contract,
  Gateway,
  Identity,
  Signer,
  signers,
} from "@hyperledger/fabric-gateway";
import * as crypto from "crypto";
import { promises as fs } from "fs";
import * as path from "path";
import { TextDecoder } from "util";
import {
  ClientConnectionUpdatePayload,
  ClientDataDocType,
  ClientRegistrationData,
  ClientRegistrationRecord,
  OrganizationConnectionUpdatePayload,
  OrganizationDataDocType,
  OrganizationRegistrationData,
  REC_PAYLOAD,
  UpdateClientConnectionList,
} from "./types";
import { bufferToJSON } from "../utils/decoder";
import { getRecordId } from "../utils/sort";
import RedisSingleton from "./cache";

type GatewayConfig = {
  chaincodeName: string;
  channelName: string;
  mspId: string;
  cryptoPath: string;
  keyDirectoryPath: string;
  certDirectoryPath: string;
  tlsCertPath: string;
  peerEndpoint: string;
  peerHostAlias: string;
};

export class ApplicationGateway {
  public utf8Decoder: TextDecoder;
  private chaincodeName: string;
  private channelName: string;
  private mspId: string;
  private cryptoPath: string;
  private keyDirectoryPath: string;
  private certDirectoryPath: string;
  private tlsCertPath: string;
  private peerEndpoint: string;
  private peerHostAlias: string;
  private client: grpc.Client = {} as grpc.Client;
  private gateway!: Gateway;
  private contract!: Contract;
  private isInitialized: boolean = false;
  constructor(config: GatewayConfig) {
    if (
      !config.certDirectoryPath ||
      !config.chaincodeName ||
      !config.channelName ||
      !config.cryptoPath ||
      !config.keyDirectoryPath ||
      !config.mspId ||
      !config.peerEndpoint ||
      !config.peerHostAlias ||
      !config.tlsCertPath
    ) {
      throw new Error("Missing required configuration values");
    }
    this.chaincodeName = config.chaincodeName;
    this.channelName = config.channelName;
    this.mspId = config.mspId;
    this.cryptoPath = config.cryptoPath;
    this.keyDirectoryPath = config.keyDirectoryPath;
    this.certDirectoryPath = config.certDirectoryPath;
    this.tlsCertPath = config.tlsCertPath;
    this.peerEndpoint = config.peerEndpoint;
    this.peerHostAlias = config.peerHostAlias;
    this.utf8Decoder = new TextDecoder();
  }

  private async newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(this.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(this.peerEndpoint, tlsCredentials, {
      "grpc.ssl_target_name_override": this.peerHostAlias,
    });
  }
  private async newIdentity(): Promise<Identity> {
    const certPath = await this.getFirstDirFileName(this.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: this.mspId, credentials };
  }
  private async getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
      throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
  }
  private async newSigner(): Promise<Signer> {
    const keyPath = await this.getFirstDirFileName(this.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
  }
  private displayInputParameters(): void {
    console.log(`channelName:       ${this.channelName}`);
    console.log(`chaincodeName:     ${this.chaincodeName}`);
    console.log(`mspId:             ${this.mspId}`);
    console.log(`cryptoPath:        ${this.cryptoPath}`);
    console.log(`keyDirectoryPath:  ${this.keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${this.certDirectoryPath}`);
    console.log(`tlsCertPath:       ${this.tlsCertPath}`);
    console.log(`peerEndpoint:      ${this.peerEndpoint}`);
    console.log(`peerHostAlias:     ${this.peerHostAlias}`);
  }
  public async initialize(): Promise<void> {
    this.displayInputParameters();
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    this.client = await this.newGrpcConnection();

    this.gateway = connect({
      client: this.client,
      identity: await this.newIdentity(),
      signer: await this.newSigner(),
      // Default timeouts for different gRPC calls
      evaluateOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
      },
      endorseOptions: () => {
        return { deadline: Date.now() + 15000 }; // 15 seconds
      },
      submitOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
      },
      commitStatusOptions: () => {
        return { deadline: Date.now() + 60000 }; // 1 minute
      },
    });

    try {
      // Get a network instance representing the channel where the smart contract is deployed.
      const network = this.gateway.getNetwork(this.channelName);

      // Get the smart contract from the network.
      this.contract = network.getContract(this.chaincodeName);
      this.isInitialized = true;
      console.log("Gateway initialized");

      // await this.contract.submitTransaction('StoreClientData', '1', JSON.stringify({ '12': '12' }))
    } catch (error) {
      console.error(`Error: ${error}`);
      throw error;
    }
  }
  public disconnect() {
    this.gateway.close();
    this.client.close();
  }
  public async addClientRegistrationData(data: ClientRegistrationRecord) {
    console.log(`Fabric Gateway-AddClientRegistrationData: Request received`);
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }

    try {
      if (data.docType === ClientDataDocType.ClientRegistrationData) {
        const payload = {
          name: data.name,
          email: data.email,
          agentEndpoint: data.agentEndpoint,
          password: data.password,
          docType: data.docType,
        } satisfies ClientRegistrationData;
        const id = data.email;
        await this.contract.submitTransaction(
          "RegisterClient",
          id,
          JSON.stringify(payload)
        );
      }
      console.log(
        `Fabric Gateway-AddClientRegistrationData: Request successful`
      );
    } catch (e) {
      console.error(`Fabric Gateway-AddClientRegistrationData: Error: ${e}`);
      throw e;
    }
  }
  public async addClientConnectionData(data: UpdateClientConnectionList) {
    console.log(`Fabric Gateway-AddClientConnectionData: Request received`);
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }
    try {
      const payload: ClientConnectionUpdatePayload = {
        organizationName: data.organizationName,
        organizationEmail: data.organizationEmail,
        organizationAgentEndpoint: data.organizationAgentEndpoint,
        connectionId: data.connectionId,
        clientEmail: data.clientEmail,
      };
      const id = crypto.randomUUID();
      await this.contract.submitTransaction(
        "AddClientConnectionList",
        id,
        JSON.stringify(payload)
      );
      console.log(`Fabric Gateway-AddClientConnectionData: Request successful`);
    } catch (e) {
      console.error(`Fabric Gateway-AddClientConnectionData: Request failed`);
      throw e;
    }
  }
  public async retrieveData<T = any>(
    id: string,
    docType: string
  ): Promise<T | null> {
    console.log(`Fabric Gateway-RetrieveData for id: ${id}`);
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }

    try {
      const bufferData = await this.contract.evaluateTransaction(
        "RetrieveSpecificDataByDocType",
        id,
        docType
      );
      if (!bufferData || bufferData.length === 0) {
        console.log(`Fabric Gateway-RetrieveData: No data found for id: ${id}`);
        return null;
      }
      const data = bufferToJSON(bufferData);
      if (!data) {
        console.log(`Fabric Gateway-RetrieveData: No data found for id: ${id}`);
        return null;
      }
      console.log(`Fabric Gateway-RetrieveData: Request successful`);
      return data;
    } catch (e) {
      console.error(`Fabric Gateway-RetrieveData: Request failed`);
      throw e;
    }
  }
  public async addOrganizationRegistrationData(
    data: OrganizationRegistrationData
  ) {
    console.log(
      `Fabric Gateway-AddOrganizationRegistrationData: Request received`
    );
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }
    try {
      if (
        data.docType === OrganizationDataDocType.OrganizationRegistrationData
      ) {
        const payload = {
          organizationName: data.organizationName,
          organizationEmail: data.organizationEmail,
          organizationAgentEndpoint: data.organizationAgentEndpoint,
          password: data.password,
          docType: data.docType,
        } satisfies OrganizationRegistrationData;
        const id = data.organizationEmail;
        // todo
        await this.contract.submitTransaction(
          "RegisterOrganization",
          id,
          JSON.stringify(payload)
        );
      } else {
        throw new Error("Invalid docType");
      }
      console.log(
        `Fabric Gateway-AddOrganizationRegistrationData: Request successful`
      );
    } catch (e) {
      console.error(
        `Fabric Gateway-AddOrganizationRegistrationData: Error: ${e}`
      );
      throw e;
    }
  }
  public async addOrganizationConnectionData(
    data: OrganizationConnectionUpdatePayload
  ) {
    console.log(
      `Fabric Gateway-AddOrganizationConnectionData: Request received`
    );
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }
    const payload = {
      organizationEmail: data.organizationEmail,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientAgentEndpoint: data.clientAgentEndpoint,
      connectionId: data.connectionId,
      type: data.type,
    };
    const id = crypto.randomUUID();
    try {
      await this.contract.submitTransaction(
        "AddOrganizationConnectionList",
        id,
        JSON.stringify(payload)
      );
      console.log(
        `Fabric Gateway-AddOrganizationConnectionData: Request successful`
      );
    } catch (e) {
      console.error(
        `Fabric Gateway-AddOrganizationConnectionData: Request failed`
      );
      throw e;
    }
  }
  public async getClientConnectionList(clientEmail: string) {
    console.log(`Fabric Gateway-GetClientConnectionList: Request received`);
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }
    try {
      const query = {
        selector: {
          docType: ClientDataDocType.ClientConnectionData,
          clientEmail: clientEmail,
        },
      };
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(query)
      );
      if (!bufferData || bufferData.length === 0) {
        console.log(
          `Fabric Gateway-GetClientConnectionList: No data found for clientEmail: ${clientEmail}`
        );
        return null;
      }
      const data = bufferToJSON(bufferData);
      if (!data) {
        console.log(
          `Fabric Gateway-GetClientConnectionList: No data found for clientEmail: ${clientEmail}`
        );
        return null;
      }
      console.log(`Fabric Gateway-GetClientConnectionList: Request successful`);
      return data;
    } catch (e) {
      console.log(e);
      console.error(`Fabric Gateway-GetClientConnectionList: Request failed`);
      throw e;
    }
  }
  public async getOrganizationClientConnectionList(organizationEmail: string) {
    console.log(
      `Fabric Gateway-GetOrganizationConnectionList: Request received`
    );
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }
    try {
      const query = {
        selector: {
          docType: OrganizationDataDocType.OrganizationConnectionData,
          organizationEmail: organizationEmail,
          type: "client",
        },
      };
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(query)
      );
      if (!bufferData || bufferData.length === 0) {
        console.log(
          `Fabric Gateway-GetOrganizationConnectionList: No data found for organizationEmail: ${organizationEmail}`
        );
        return null;
      }
      const data = bufferToJSON(bufferData);
      if (!data) {
        console.log(
          `Fabric Gateway-GetOrganizationConnectionList: No data found for organizationEmail: ${organizationEmail}`
        );
        return null;
      }
      console.log(
        `Fabric Gateway-GetOrganizationConnectionList: Request successful`
      );
      return data;
    } catch (e) {
      console.log(e);
      console.error(
        `Fabric Gateway-GetOrganizationConnectionList: Request failed`
      );
      throw e;
    }
  }
  public async getOrganizationOrganizationConnectionList(
    organizationEmail: string
  ) {
    console.log(
      `Fabric Gateway-GetOrganizationConnectionList: Request received`
    );
    if (!this.isInitialized) {
      throw new Error("Gateway not initialized");
    }
    try {
      const query = {
        selector: {
          docType: OrganizationDataDocType.OrganizationConnectionData,
          organizationEmail: organizationEmail,
          type: "organization",
        },
      };
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(query)
      );
      if (!bufferData || bufferData.length === 0) {
        console.log(
          `Fabric Gateway-GetOrganizationConnectionList: No data found for organizationEmail: ${organizationEmail}`
        );
        return null;
      }
      const data = bufferToJSON(bufferData);
      if (!data) {
        console.log(
          `Fabric Gateway-GetOrganizationConnectionList: No data found for organizationEmail: ${organizationEmail}`
        );
        return null;
      }
      console.log(
        `Fabric Gateway-GetOrganizationConnectionList: Request successful`
      );
      return data;
    } catch (e) {
      console.log(e);
      console.error(
        `Fabric Gateway-GetOrganizationConnectionList: Request failed`
      );
      throw e;
    }
  }
  public async getConnectedOrganizationClients({
    organizationId,
    connectedOrganizationId,
  }: {
    connectedOrganizationId: string;
    organizationId: string;
  }) {
    try {
      // check if the organization is connected with current organization
      const checkExistQuery = {
        selector: {
          docType: OrganizationDataDocType.OrganizationConnectionData,
          // connected organization id
          clientEmail: connectedOrganizationId,
          // current organization id
          organizationEmail: organizationId,
          type: "organization",
        },
      };
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(checkExistQuery)
      );
      if (!bufferData || bufferData.length === 0) {
        return [];
      }
      // retrive connection list for connected organization
      const listRetrievalQuery = {
        selector: {
          docType: OrganizationDataDocType.OrganizationConnectionData,
          organizationEmail: connectedOrganizationId,
          type: "client",
        },
      };
      const bufferDataList = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(listRetrievalQuery)
      );
      if (!bufferDataList || bufferDataList.length === 0) {
        return [];
      }
      const data = bufferToJSON(bufferDataList);
      return data;
    } catch (e) {
      console.error(
        `Error in getting connected organization clients: ${JSON.stringify(e)}`
      );
      throw e;
    }
  }
  public async getConnectedOrganizationSpecificClientData({
    connectedOrganizationId,
    connectionId,
    organizationId,
  }: {
    connectedOrganizationId: string;
    connectionId: string;
    organizationId: string;
  }) {
    console.log(
      `Fabric Gateway-ConnectedOrganizationClientData: Request received`
    );
    try {
      // check if the organization is connected with current organization
      const checkExistQuery = {
        selector: {
          docType: OrganizationDataDocType.OrganizationConnectionData,
          // connected organization id
          clientEmail: connectedOrganizationId,
          // current organization id
          organizationEmail: organizationId,
          type: "organization",
        },
      };
      const bufferExists = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(checkExistQuery)
      );
      if (!bufferExists || bufferExists.length === 0) {
        return {
          results: [],
          isEmpty: true,
        };
      }
      const dataSearchQuery = {
        selector: {
          docType: OrganizationDataDocType.RecSortData,
          connectionId: connectionId,
          organizationId: connectedOrganizationId,
        },
      };
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(dataSearchQuery)
      );
      if (!bufferData || bufferData.length === 0) {
        return {
          results: [],
          isEmpty: true,
        };
      }
      const data = await bufferToJSON(bufferData);
      // parse existing data
      let extractedArray = data.map((item: any) => JSON.parse(item.data));
      console.log(extractedArray);
      // sort data based on timestamp
      extractedArray.sort((a: any, b: any) => a.timestamp - b.timestamp);
      return {
        results: extractedArray,
        isEmpty: false,
      };
    } catch (e) {
      console.log(
        `Fabric Gateway-ConnectedOrganizationClientData: Request falied`, e
      );
      throw e;
    }
  }
  public async getAllOrganizationData() {
    console.log(`Fabric Gateway-GetAllOrganizationData: Request received`);
    try {
      if (!this.isInitialized) {
        throw new Error("Gateway not initialized");
      }
      const query = {
        selector: {
          docType: OrganizationDataDocType.OrganizationRegistrationData,
        },
      };
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(query)
      );
      if (!bufferData || bufferData.length === 0) {
        console.log(`Fabric Gateway-GetAllOrganizationData: No data found`);
        return [];
      }
      const data = bufferToJSON(bufferData);
      console.log("all organization", data);
      if (!data) {
        console.log(`Fabric Gateway-GetAllOrganizationData: No data found`);
        return [];
      }
      // iterate over the data and select only the required fields
      const modifiedData = data.map((item: any) => {
        return {
          organizationName: item.organizationName,
          organizationEmail: item.organizationEmail,
          organizationAgentEndpoint: item.organizationAgentEndpoint,
        };
      });
      console.log(`Fabric Gateway-GetAllOrganizationData: Request successful`);
      return modifiedData;
    } catch (e) {
      console.error(`Fabric Gateway-GetAllOrganizationData: Request failed`);
      throw e;
    }
  }
  public async getRealtimeData(connectionId: string) {
    try {
      const key = `realtime-${connectionId}`;
      // retrieve data from cache
      const data = await RedisSingleton.getInstance().get<{
        realTimeElecSum: string;
        realTimeForcastedElecSum: string;
        organizationId: string;
        timestamp: string;
      }>(key);
      // todo: test
      return {
        production: parseFloat(data?.realTimeElecSum || "0"),
        forcasted: parseFloat(data?.realTimeForcastedElecSum || "0"),
        timestamp: parseFloat(data?.timestamp || "0"),
      };
    } catch (e) {
      console.error(`Error in getting realtime data: ${JSON.stringify(e)}`);
      throw e;
    }
  }
  public async getSortedData({
    connectionId,
    organizationId,
  }: {
    connectionId: string;
    organizationId: string;
  }) {
    try {
      const query = {
        selector: {
          docType: OrganizationDataDocType.RecSortData,
          organizationId: organizationId,
          connectionId: connectionId,
        },
      };
      console.log(JSON.stringify(query));
      const bufferData = await this.contract.evaluateTransaction(
        "GetAllAssetsByQuery",
        JSON.stringify(query)
      );
      console.log(bufferData);
      if (!bufferData || bufferData.length === 0) {
        return {
          results: [],
          isEmpty: true,
        };
      }
      const data = bufferToJSON(bufferData);
      console.log("data", data)
      // parse existing data
      let extractedArray = data.map((item: any) => JSON.parse(item.data));
      console.log(extractedArray)
      // sort data based on timestamp
      extractedArray.sort((a: any, b: any) => a.timestamp - b.timestamp);

      return {
        results: extractedArray,
        isEmpty: false,
      };
    } catch (e) {
      throw e;
    }
  }
  // this will be called by the org controller to store data and handle realtime
  public async handleSingleData(message: any) {
    try {
      const parsedData = JSON.parse(message);
      const connectionId = parsedData.connectionId;
      const organizationId = parsedData.organizationId;
      const curElec = parsedData.message.split(",")[2];
      const forcastedElec = parsedData.message.split(",")[3];
      const timestamp = parsedData.message.split(",")[1];

      // stores data in cache and handle realtime data
      await this.setRealtimeData({
        connectionId,
        organizationId,
        curElec,
        forcastedElec,
        timestamp,
      });
      // store data in fabric
      await this.storeSingleData({
        connectionId,
        organizationId,
        message: parsedData.message,
      });
    } catch (e) {
      console.error(`Error parsing message: ${JSON.stringify(e)}`);
    }
  }
  public async handleBulkData(messages: any) {
    try {
      const parsedData = JSON.parse(messages);
      const connectionId = parsedData.connectionId;
      const organizationId = parsedData.organizationId;
      const dataArr = parsedData.message;

      // store raw data and generate processed data map to store sorted data
      const processedDataMap = this.generateProcessDataMap(
        dataArr,
        connectionId,
        organizationId
      );
      // store processed data in fabric and now the data is sorted so we don't need to await for response
      for (let [key, value] of processedDataMap) {
        console.log(`Storing data for key: ${key}`);
        this.storeProcessedData(key, connectionId, organizationId, value);
      }
    } catch (e) {
      console.error(`Error parsing message: ${JSON.stringify(e)}`);
    }
  }
  private async storeSingleData(payload: {
    connectionId: string;
    organizationId: string;
    message: string;
  }) {
    try {
      console.log(`Fabric Gateway-StoreSingleData: Request received`);
      const id = crypto.randomUUID();
      const connectionId = payload.connectionId;
      const organizationId = payload.organizationId;
      const data = payload.message;
      const docType = OrganizationDataDocType.RecRawData;
      // storing raw data without awaiting for the response
      this.contract.submitTransaction(
        "RECDataStore",
        id,
        connectionId,
        organizationId,
        data,
        docType
      );
      // split info from message
      const dataTime = data.split(",")[1]?.toString();
      let curElectricityProduction = data.split(",")[2];
      let curForcastedElectricity = data.split(",")[3];
      const {
        recordId,
        date: productionDate,
        timestamp: newTimestamp,
      } = getRecordId({ timestamp: dataTime!, connectionId });
      // check if data exists
      const bufferData = await this.contract.evaluateTransaction(
        "RetrieveData",
        recordId
      );

      let existingData = null;
      // if no data then this will be a 0 length unit array
      if (bufferData.length) {
        existingData = bufferToJSON(bufferData);
      }
      if (!existingData) {
        const payload: REC_PAYLOAD = {
          organizationId,
          timestamp: parseInt(newTimestamp.toString()),
          dataConsumed: 1,
          productionDate,
          forcasted: parseFloat(curForcastedElectricity!.toString()),
          production: parseFloat(curElectricityProduction!.toString()),
        };
        // storing sort data
        await this.contract.submitTransaction(
          "RECDataStore",
          recordId,
          connectionId,
          organizationId,
          JSON.stringify(payload),
          OrganizationDataDocType.RecSortData
        );
      } else {
        try {
          let storedData = JSON.parse(existingData.data);
          const payload: REC_PAYLOAD = {
            organizationId,
            timestamp: storedData.timestamp,
            dataConsumed: parseInt(storedData.dataConsumed) + 1,
            productionDate: storedData.productionDate,
            forcasted:
              parseFloat(storedData.forcasted) +
              parseFloat(curForcastedElectricity!),
            production:
              parseFloat(storedData.production) +
              parseFloat(curElectricityProduction!),
          };
          // storing sort data
          await this.contract.submitTransaction(
            "RECDataStore",
            recordId,
            connectionId,
            organizationId,
            JSON.stringify(payload),
            OrganizationDataDocType.RecSortData
          );
        } catch (parsingError) {
          throw new Error(
            `Error parsing existing data: ${JSON.stringify(parsingError)}`
          );
        }
      }
      console.log(`Fabric Gateway-StoreSingleData: Request successful`);
    } catch (e) {
      console.error(`Fabric Gateway-StoreSingleData: Request failed`);
      throw e;
    }
  }
  private async setRealtimeData({
    connectionId,
    organizationId,
    curElec,
    forcastedElec,
    timestamp,
  }: {
    connectionId: string;
    organizationId: string;
    curElec: string;
    forcastedElec: string;
    timestamp: string;
  }) {
    try {
      let cachedData = await RedisSingleton.getInstance().get<{
        realTimeElecSum: string;
        realTimeForcastedElecSum: string;
        timestamp: string;
        organizationId: string;
      }>(`realtime-${connectionId}`);
      let realTimeElecSum = cachedData ? cachedData.realTimeElecSum : 0;
      let realTimeForcastedElecSum = cachedData
        ? cachedData.realTimeForcastedElecSum
        : 0;
      realTimeElecSum = realTimeElecSum
        ? parseFloat(realTimeElecSum.toString()) + parseFloat(curElec)
        : parseFloat(curElec);
      realTimeForcastedElecSum = realTimeForcastedElecSum
        ? parseFloat(realTimeForcastedElecSum.toString()) +
          parseFloat(forcastedElec)
        : parseFloat(forcastedElec);
      const payload = {
        realTimeElecSum,
        realTimeForcastedElecSum,
        timestamp,
        organizationId,
      };
      await RedisSingleton.getInstance().set(
        `realtime-${connectionId}`,
        payload
      );
    } catch (e) {
      console.error(`Error in realtime data: ${JSON.stringify(e)}`);
    }
  }
  private generateProcessDataMap(
    dataArr: any[],
    connectionId: string,
    organizationId: string
  ) {
    const processedDataMap = new Map();
    for (let i = 0; i < dataArr.length; i++) {
      const id = crypto.randomUUID();
      const data = dataArr[i];
      // in case of last data when data is empty or ""
      if (data.length === 0) {
        break;
      }
      const docType = OrganizationDataDocType.RecRawData;
      this.contract.submitTransaction(
        "RECDataStore",
        id,
        connectionId,
        organizationId,
        data,
        docType
      );
      const dataTime = data.split(",")[1]?.toString();
      let curElectricityProduction = data.split(",")[2];
      let curForcastedElectricity = data.split(",")[3];
      const { recordId, date: productionDate } = getRecordId({
        timestamp: dataTime!,
        connectionId,
      });

      if (processedDataMap.has(recordId)) {
        const mappedData = processedDataMap.get(recordId);
        const payload: REC_PAYLOAD = {
          organizationId,
          timestamp: mappedData.timestamp,
          dataConsumed: parseInt(mappedData.dataConsumed) + 1,
          productionDate: mappedData.productionDate,
          forcasted:
            parseFloat(mappedData.forcasted) +
            parseFloat(curForcastedElectricity!),
          production:
            parseFloat(mappedData.production) +
            parseFloat(curElectricityProduction!),
        };
        processedDataMap.set(recordId, payload);
      } else {
        const payload: REC_PAYLOAD = {
          organizationId,
          timestamp: parseInt(dataTime),
          dataConsumed: 1,
          productionDate,
          forcasted: parseFloat(curForcastedElectricity!.toString()),
          production: parseFloat(curElectricityProduction!.toString()),
        };
        processedDataMap.set(recordId, payload);
      }
    }
    return processedDataMap;
  }
  private async storeProcessedData(
    recordId: string,
    connectionId: string,
    organizationId: string,
    data: REC_PAYLOAD
  ) {
    try {
      // retrieve data
      const bufferData = await this.contract.evaluateTransaction(
        "RetrieveData",
        recordId
      );
      let existingData = null;
      // if no data then this will be a 0 length unit array
      if (bufferData.length) {
        existingData = bufferToJSON(bufferData);
      }
      if (!existingData) {
        await this.contract.submitTransaction(
          "RECDataStore",
          recordId,
          connectionId,
          organizationId,
          JSON.stringify(data),
          OrganizationDataDocType.RecSortData
        );
      } else {
        try {
          let storedData = JSON.parse(existingData.data);
          const payload: REC_PAYLOAD = {
            organizationId,
            timestamp: storedData.timestamp,
            dataConsumed: parseInt(storedData.dataConsumed) + 1,
            productionDate: storedData.productionDate,
            forcasted:
              parseFloat(storedData.forcasted) +
              parseFloat(data.forcasted.toString()),
            production:
              parseFloat(storedData.production) +
              parseFloat(data.production.toString()),
          };
          // storing sort data
          await this.contract.submitTransaction(
            "RECDataStore",
            recordId,
            connectionId,
            organizationId,
            JSON.stringify(payload),
            OrganizationDataDocType.RecSortData
          );
        } catch (parsingError) {
          throw new Error(
            `Error parsing existing data: ${JSON.stringify(parsingError)}`
          );
        }
      }
    } catch (e) {
      console.error(`Error storing processed data: ${JSON.stringify(e)}`);
    }
  }
}
