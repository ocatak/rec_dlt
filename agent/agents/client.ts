import {
  Agent, InitConfig, HttpOutboundTransport, BasicMessageEventTypes, BasicMessageStateChangedEvent, BasicMessageRole, ConnectionStateChangedEvent, ConnectionEventTypes,
  RecordNotFoundError,
  MessageSendingError
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { greenText, purpleText, redText } from '../utils/Logger'
import { createWalletKey } from '../wallet/create'
import { encodeToBase64 } from '../utils/encoder'
import { getAskarAnonCredsIndyModules } from '../module'
import express, { Express, Router } from 'express';
import RedisSingleton, { Channel } from '../utils/cache'
import axios, { AxiosError } from 'axios'


export type DemoAgent = Agent<ReturnType<typeof getAskarAnonCredsIndyModules>>

export class ClientAgent {
  public port: number
  public name: string
  public config: InitConfig
  public agent: DemoAgent
  public useLegacyIndySdk: boolean
  public endpoints: string[]
  public app: Express
  private fabricEndpoint: string
  public constructor({
    port,
    name,
    useLegacyIndySdk = false,
    fabricEndpoint,
    endpoints = []
  }: {
    port: number
    name: string
    fabricEndpoint: string
    useLegacyIndySdk?: boolean
    endpoints?: string[]
  }) {
    this.fabricEndpoint = fabricEndpoint
    this.name = name
    this.port = port
    this.endpoints = endpoints.length ? endpoints : [`http://localhost:${port}`]
    const config = {
      label: name,
      walletConfig: {
        id: encodeToBase64(name),
        key: name,
      },
      endpoints: this.endpoints,
    } satisfies InitConfig
    this.config = config
    this.useLegacyIndySdk = useLegacyIndySdk
    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: getAskarAnonCredsIndyModules(),
    })
    this.app = express()
    this.app.use(express.json())

    // Routes
    this.app.get('/status', (req, res) => {
      res.send({ "status": 200 });
    });

    this.app.get('/agent/info', (req, res) => {
      try {
        const agentInfo = {
          clientId: this.name,
          agentEndpoint: this.endpoints[0]
        }
        res.status(200).send(agentInfo);
      } catch (e) {
        res.status(500).send({ "status": 500, "message": (e as Error).message });
      }
    })

    // jwt token needs to be verified from fabric server
    this.app.post('/accept-invitation', async (req, res) => {
      try {
        const invitation = req.body.invitation;
        if (!invitation) {
          return res.status(400).send({ "status": 400, "message": "Invitation is required" });
        }
        const invitationResponse = await this.receiveConnection(invitation);
        res.status(200).json(invitationResponse)
      } catch (e) {
        res.status(500).send({ "status": 500, "message": (e as Error).message });
      }
    })

    // send message to organization
    this.app.post('/send-message', async (req, res) => {
      try {
        const { connectionId, messageData, organizationId } = req.body;
        // validate request
        if (!connectionId) {
          return res.status(400).send({ "status": 400, "message": "connectionId is required" });
        }
        // validate request
        if (!organizationId) {
          return res.status(400).send({ "status": 400, "message": "organizationId is required" });
        }
        // check if connection exists
        const connectionExists = await this.connectionExists(connectionId);
        if (!connectionExists) {
          return res.status(400).send({ "status": 400, "message": "Connection does not exist" });
        }
        // send msg
        await this.sendMessage({ connectionId, messageData, organizationId });
        res.status(200).send({ "status": 200, "message": "Message sent" });
      } catch (e) {
        if (e instanceof RecordNotFoundError) {
          return res.status(400).send({ "status": 400, "message": (e as RecordNotFoundError).message });
        }
        if (e instanceof MessageSendingError) {
          return res.status(400).send({ "status": 400, "message": (e as MessageSendingError).message });
        }
        // unknown error
        res.status(500).send({ "status": 500, "message": (e as Error).message });
      }
    })

    this.agent.registerInboundTransport(new HttpInboundTransport({ app: this.app, port }))
    this.agent.registerOutboundTransport(new HttpOutboundTransport())
  }

  public async initializeAgent() {
    await this.agent.initialize()
    console.log(greenText(`Agent ${this.name} created on port ${this.port}!\n`))
    this.messageListener()
    this.connectionStateListener()
    // Create wallet key
    await createWalletKey(this.agent)

  }

  // listeners
  private connectionStateListener() {
    console.log(purpleText(`Listener activated: connectionState on ${this.name} agent`))
    this.agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
      console.log(purpleText(`${this.name} connection state: ${payload.connectionRecord.state}`))
      if (payload.connectionRecord.state === 'completed') {
        const theirLabel = payload.connectionRecord.theirLabel
        const connectionId = payload.connectionRecord.id
        try {
          // organization need to be registered on fabric server
          // fetch organization info from fabric server to verify
          const response = await axios.get(`${this.fabricEndpoint}/organization/${theirLabel}`)
          const organizationData = response.data
          const data = {
            clientEmail: this.agent.config.label,
            organizationName: organizationData.organizationName,
            organizationEmail: organizationData.organizationEmail,
            organizationAgentEndpoint: organizationData.organizationAgentEndpoint,
            connectionId

          }
          // publish to redis channel
          // this will update client's connection list
          RedisSingleton.getInstance().publish(Channel.CLIENT_CONNECTION, JSON.stringify(data))

        } catch (axiosError: any) {
          console.error(redText(`Error fetching organization data from fabric server: ${axiosError.message}`))
          return
        }
      }

    })
  }

  private messageListener() {
    console.log(purpleText(`Listener activated: messageListener on ${this.name} agent`))
    this.agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async (event: BasicMessageStateChangedEvent) => {
      if (event.payload.basicMessageRecord.role === BasicMessageRole.Sender) {
        console.log(purpleText(`Received your message: ${event.payload.message.content}`))
      }

    })
  }

  // todo: need to implement waitForConnection which will handle connection listener output
  private async receiveConnection(invitationUrl: string) {
    const { connectionRecord } = await this.agent.oob.receiveInvitationFromUrl(invitationUrl, {
      label: this.name,
    })
    if (!connectionRecord) {
      throw new Error(redText(`No connectionRecord has been created from invitation`))
    }
    console.log("receive connectionrecord", connectionRecord)
    return connectionRecord
  }

  private async sendMessage(this: ClientAgent, { connectionId, messageData, organizationId }: { connectionId: string, organizationId: string, messageData: string[] | string }) {
    try {
      // todo validate format here or in front end
      if (Array.isArray(messageData)) {
        await this.agent.basicMessages.sendMessage(connectionId, JSON.stringify({ metadata: { csv: true, organizationId }, data: messageData }))
      } else {
        await this.agent.basicMessages.sendMessage(connectionId, JSON.stringify({ metadata: { csv: false, organizationId }, data: messageData }))
      }
    } catch (error) {
      throw error
    }
  }

  private async connectionExists(connectionId: string): Promise<boolean> {
    try {
      const connection = await this.agent.connections.findById(connectionId)
      if (!connection) {
        return false
      }
      return true
    } catch (error) {
      return false
    }

  }

  public async getConnections() {
    try {
      const connection = await this.agent.connections
      if (!connection) {
        return false
      }
      return true
    } catch (error) {
      return false
    }

  }

}