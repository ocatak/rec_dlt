import axios from "axios";
import { ClientAgent } from "./agents/client";

async function main() {
    const fabricUrl = 'localhost:3000';
    const recApi = 'http://localhost:5000';
    const recAgent = 'localhost:4999';

    // register a new organization
    const orgRegPayload = {
        "email": "org1@org.com",
        "password": "123456",
        "name": "org-1",
        "agentEndpoint": "https://localhost:5000"
    }
    await axios.post(`http://${fabricUrl}/organization/register`, orgRegPayload)
    console.log("Organization registered successfully")
    // register a new client
    const clientRegPayload = {
        "email": "client@org.com",
        "password": "123456",
        "name": "client-1",
        "agentEndpoint": "https://localhost:5000"
    }
    await axios.post(`http://${fabricUrl}/client/register`, clientRegPayload)
    const invitationResponse = await axios.post(`${recApi}/create-invitation`)
    console.log("Invitation created successfully")
    const invitation = invitationResponse.data.inviteResult.data.invitationUrl
    const clientAgent = new ClientAgent({
        port: 4000,
        name: 'client@org.com',
        endpoints: ['http://localhost:4000'],
        fabricEndpoint: 'http://localhost:3000'
    })
    await clientAgent.initializeAgent()
    await clientAgent.receiveConnection(invitation)
    console.log("Connection request received")
}
void main()