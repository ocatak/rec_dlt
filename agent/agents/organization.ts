import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
} from "@aries-framework/anoncreds";
import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  ConnectionsModule,
  CredentialsModule,
  DidsModule,
  InitConfig,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
  HttpOutboundTransport,
  CredentialEventTypes,
  CredentialStateChangedEvent,
  CredentialState,
  ProofEventTypes,
  ProofStateChangedEvent,
  ProofState,
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  BasicMessageRole,
  TypedArrayEncoder,
  DidCreateResult,
  DidOperationStateActionBase,
  KeyType,
  Wallet,
  WalletCreateKeyOptions,
  ConnectionStateChangedEvent,
  ConnectionEventTypes,
  ConnectionRecord,
  CredentialExchangeRecord,
} from "@aries-framework/core";
import type { IndySdkPoolConfig } from "@aries-framework/indy-sdk";
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidRegistrar,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
  type IndyVdrPoolConfig,
} from "@aries-framework/indy-vdr";
import { AskarModule } from "@aries-framework/askar";
import { anoncreds } from "@hyperledger/anoncreds-nodejs";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";
import { indyVdr } from "@hyperledger/indy-vdr-nodejs";
import { AnonCredsRsModule } from "@aries-framework/anoncreds-rs";
import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";

import { greenText, purpleText, redText } from "../utils/Logger";

import { randomUUID } from "crypto";
import { createWalletKey } from "../wallet/create";
import {
  CustomInvitationRespone,
  ErrorResponse,
  OrganizationConnectionPayload,
  StatusTypes,
  SuccessResponse,
} from "../utils/types";
import { createInvitation } from "../connection/create";
import { RedisClientType, createClient } from "redis";
import { encodeToBase64 } from "../utils/encoder";
import express, { Express, Router } from "express";
import axios, { AxiosError, isAxiosError } from "axios";
import RedisSingleton, { Channel } from "../utils/cache";

// http://dev.greenlight.bcovrin.vonx.io/genesis

const bcovrin = `{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"138.197.138.255","client_port":9702,"node_ip":"138.197.138.255","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"138.197.138.255","client_port":9704,"node_ip":"138.197.138.255","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"138.197.138.255","client_port":9706,"node_ip":"138.197.138.255","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"138.197.138.255","client_port":9708,"node_ip":"138.197.138.255","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}`;

export const indyNetworkConfig = {
  // Need unique network id as we will have multiple agent processes in the agent
  id: randomUUID(),
  genesisTransactions: bcovrin,
  indyNamespace: "bcovrin:test",
  isProduction: false,
  connectOnStartup: true,
} satisfies IndySdkPoolConfig | IndyVdrPoolConfig;

export type DemoAgent = Agent<ReturnType<typeof getAskarAnonCredsIndyModules>>;

export class Organization {
  public port: number;
  public name: string;
  public config: InitConfig;
  public agent: DemoAgent;
  public useLegacyIndySdk: boolean;
  private publicDID?: string;
  public endpoints: string[];
  public publisher: RedisClientType | undefined;
  private fabricEndpoint: string;
  public app: Express;

  public constructor({
    port,
    name,
    useLegacyIndySdk = false,
    fabricEndpoint,
    endpoints = [],
  }: {
    port: number;
    name: string;
    useLegacyIndySdk?: boolean;
    fabricEndpoint: string;
    endpoints?: string[];
  }) {
    this.name = name;
    this.port = port;
    this.endpoints = endpoints;
    if (!endpoints.length) {
      this.endpoints = [`http://localhost:${this.port}`];
    }
    const config = {
      label: name,
      walletConfig: {
        id: encodeToBase64(name),
        key: name,
      },
      endpoints: this.endpoints,
    } satisfies InitConfig;
    this.config = config;
    this.fabricEndpoint = fabricEndpoint;
    this.useLegacyIndySdk = useLegacyIndySdk;

    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: getAskarAnonCredsIndyModules(),
    });
    this.app = express();
    this.app.use(express.json());

    // Routes
    this.app.get("/status", (req, res) => {
      res.send({ status: 200 });
    });

    this.app.get("/agent/info", (req, res) => {
      try {
        const agentInfo = {
          clientId: this.name,
          agentEndpoint: this.endpoints[0],
        };
        res.status(200).send(agentInfo);
      } catch (e) {
        res.status(500).send({ status: 500, message: (e as Error).message });
      }
    });

    this.app.get("/create-invitation", async (req, res) => {
      try {
        const invitation = await this.createInvitation();
        res.status(200).send(invitation);
      } catch (e) {
        res.status(500).send({ status: 500, message: (e as Error).message });
      }
    });

    this.app.post("/accept-invitation", async (req, res) => {
      try {
        const invitation = req.body.invitation;
        if (!invitation) {
          return res
            .status(400)
            .send({ status: 400, message: "Invitation is required" });
        }
        const connectionRecord = await this.receiveConnection(invitation);
        res.status(200).send(connectionRecord);
      } catch (e) {
        res.status(500).send({ status: 500, message: (e as Error).message });
      }
    });

    this.agent.registerInboundTransport(
      new HttpInboundTransport({ port, app: this.app })
    );
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
  }

  public async initializeAgent() {
    await this.agent.initialize();
    console.log(
      greenText(`Agent ${this.name} created on port ${this.port}!\n`)
    );
    this.publisher = createClient();
    this.publisher.on("error", (err) => console.log("Redis Client Error", err));
    await this.publisher.connect();
    // message & connectionState listeners
    this.messageListener();
    this.connectionStateListener();
    // Create wallet key
    await createWalletKey(this.agent);
  }

  // listeners

  private connectionStateListener() {
    // todo: implement all functionality
    console.log(
      purpleText(`Listener activated: connectionState on ${this.name} agent`)
    );
    this.agent.events.on<ConnectionStateChangedEvent>(
      ConnectionEventTypes.ConnectionStateChanged,
      async ({ payload }) => {
        console.log(
          purpleText(
            `${this.name} connection state: ${payload.connectionRecord.state}`
          )
        );
        if (payload.connectionRecord.state === "completed") {
          const connection_id = payload.connectionRecord.id;
          const theirLabel = payload.connectionRecord.theirLabel;
          console.log(theirLabel, payload.connectionRecord);
          // todo some how figure out wether other side is organization or client
          try {
            console.log("theirLabel", theirLabel);
            const response = await axios.get(
              `${this.fabricEndpoint}/organization/${theirLabel}`
            );
            // organization connected
            const organizationData = response.data;
            const data: OrganizationConnectionPayload = {
              organizationEmail: this.agent.config.label,
              connectionId: connection_id,
              clientEmail: organizationData.organizationName,
              clientName: organizationData.organizationEmail,
              clientAgentEndpoint: organizationData.organizationAgentEndpoint,
              type: "organization",
            };
            console.log("organization connected", data);
            console.log(`Publishing to ${Channel.ORGANIZATION_CONNECTION}`);
            RedisSingleton.getInstance().publish(
              Channel.ORGANIZATION_CONNECTION,
              JSON.stringify(data)
            );
          } catch (e) {
            // maybe client connected
            if (axios.isAxiosError(e)) {
              try {
                const response = await axios.get(
                  `${this.fabricEndpoint}/client/${theirLabel}`
                );
                console.log(response.data);
                const clientData = response.data;
                const data: OrganizationConnectionPayload = {
                  organizationEmail: this.agent.config.label,
                  connectionId: connection_id,
                  clientEmail: clientData.clientEmail,
                  clientName: clientData.clientName,
                  clientAgentEndpoint: clientData.clientAgentEndpoint,
                  type: "client",
                };
                console.log("client connected", data);
                console.log(`Publishing to ${Channel.ORGANIZATION_CONNECTION}`);
                RedisSingleton.getInstance().publish(
                  Channel.ORGANIZATION_CONNECTION,
                  JSON.stringify(data)
                );
              } catch (e) {
                // todo: remove connection record from agent
              }
            } else {
              // todo: remove connection record from agent
            }
          }
        }
      }
    );
  }

  private messageListener() {
    console.log(
      purpleText(`Listener activated: messageListener on ${this.name} agent`)
    );
    this.agent.events.on(
      BasicMessageEventTypes.BasicMessageStateChanged,
      async (event: BasicMessageStateChangedEvent) => {
        if (
          event.payload.basicMessageRecord.role === BasicMessageRole.Receiver
        ) {
          console.log(
            purpleText(
              `${this.name} received a new message: ${event.payload.message.content}`
            )
          );

          let modifiedContent = JSON.parse(event.payload.message.content);
          const isCSV = modifiedContent.metadata.csv;
          console.log(
            "organizzationId",
            modifiedContent.metadata.organizationId
          );
          const data = {
            connectionId: event.payload.basicMessageRecord.connectionId,
            organizationId: modifiedContent.metadata.organizationId,
            message: modifiedContent.data,
          };
          if (!isCSV) {
            // publish to single process channel
            RedisSingleton.getInstance().publish(
              Channel.SINGLE_PROCESS,
              JSON.stringify(data)
            );
          } else if (isCSV) {
            // publish to multi process channel
            RedisSingleton.getInstance().publish(
              Channel.MULTI_PROCESS,
              JSON.stringify(data)
            );
          }
        }
      }
    );
  }

  /**
   * The function creates an invitation and returns a success response with the result or an error
   * response with an error message.
   * @returns The function `createInvitation` returns a Promise that resolves to either a
   * `SuccessResponse<CustomInvitationRespone>` or an `ErrorResponse`.
   */
  public async createInvitation(): Promise<
    SuccessResponse<CustomInvitationRespone> | ErrorResponse
  > {
    // if publicly accessable domain is passed e.g. ngrok url
    try {
      const result = await createInvitation(this.agent, {
        domain: this.endpoints[0],
        label: this.name,
      });
      return {
        status: StatusTypes.success,
        data: result,
      };
    } catch (e: any) {
      return {
        status: StatusTypes.error,
        message: e.message,
      };
    }
  }
  // todo: need to implement waitForConnection which will handle connection listener output
  public async receiveConnection(invitationUrl: string) {
    const { connectionRecord } = await this.agent.oob.receiveInvitationFromUrl(
      invitationUrl,
      {
        label: this.name,
      }
    );
    if (!connectionRecord) {
      throw new Error(
        redText(`No connectionRecord has been created from invitation`)
      );
    }
    console.log("receive connectionrecord", connectionRecord);
    return connectionRecord;
  }

  public getAgentName() {
    return this.name;
  }
}

function getAskarAnonCredsIndyModules() {
  const legacyIndyCredentialFormatService =
    new LegacyIndyCredentialFormatService();
  const legacyIndyProofFormatService = new LegacyIndyProofFormatService();

  return {
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      credentialProtocols: [
        new V1CredentialProtocol({
          indyCredentialFormat: legacyIndyCredentialFormatService,
        }),
        new V2CredentialProtocol({
          credentialFormats: [
            legacyIndyCredentialFormatService,
            new AnonCredsCredentialFormatService(),
          ],
        }),
      ],
    }),
    proofs: new ProofsModule({
      autoAcceptProofs: AutoAcceptProof.ContentApproved,
      proofProtocols: [
        new V1ProofProtocol({
          indyProofFormat: legacyIndyProofFormatService,
        }),
        new V2ProofProtocol({
          proofFormats: [
            legacyIndyProofFormatService,
            new AnonCredsProofFormatService(),
          ],
        }),
      ],
    }),
    anoncreds: new AnonCredsModule({
      registries: [new IndyVdrAnonCredsRegistry()],
    }),
    anoncredsRs: new AnonCredsRsModule({
      anoncreds,
    }),
    indyVdr: new IndyVdrModule({
      indyVdr,
      networks: [indyNetworkConfig],
    }),
    dids: new DidsModule({
      resolvers: [new IndyVdrIndyDidResolver()],
      registrars: [new IndyVdrIndyDidRegistrar()],
    }),
    askar: new AskarModule({
      ariesAskar,
    }),
  } as const;
}
