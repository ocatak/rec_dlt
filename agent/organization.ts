import { Organization } from "./agents/organization";
import organizations from '../data/organizations'

// async function startOrganization() {
//     const orgId: number = parseInt(process.argv[2])
//     const org = organizations[orgId]
//     const orgnization = new Organization({
//         port: org.port,
//         name: org.name,
//         endpoints: org.endpoints,
//         fabricEndpoint: org.fabricEndpoint
//     })
//     await orgnization.initializeAgent()
// }

async function startOrganization() {
    console.log(process.argv[2], process.argv[3])
    
    const orgnization = new Organization({
        port:  parseInt(process.argv[3]),
        name: process.argv[2],
        fabricEndpoint: process.env.FABRIC_API || "http://localhost:3005",
    })
    await orgnization.initializeAgent()
}
void startOrganization();
