import { ClientAgent } from "./agents/client";
import clients from '../data/clients'

// async function startClient() {
//     console.log(process.argv[2])
//     const clientId: number = parseInt(process.argv[2])
//     const client = clients[clientId]
//     const clientAgent = new ClientAgent({
//         port: client.port ,
//         name: client.name,
//         endpoints: client.endpoints,
//         fabricEndpoint: client.fabricEndpoint
//     })
//     await clientAgent.initializeAgent()
// }

async function startClient() {
    console.log(process.argv[2], process.argv[3])
    
    const clientAgent = new ClientAgent({
        port:  parseInt(process.argv[3]),
        name: process.argv[2],
        fabricEndpoint: process.env.FABRIC_API || "http://localhost:3005",
    })
    await clientAgent.initializeAgent()
}
void startClient();