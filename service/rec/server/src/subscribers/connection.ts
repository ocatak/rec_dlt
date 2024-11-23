import { ClientController } from "../controller/client.controller";
import { OrganizationController } from "../controller/organization.controller";
import RedisSingleton, { Channel } from "../helper/cache";

export async function clientConnectionSubscriber() {
    await RedisSingleton.getInstance().subscribe(Channel.CLIENT_CONNECTION, async (message) => {
        // console.log('Received message: ', message);
        console.log(`Received message on channel ${Channel.CLIENT_CONNECTION}: `, message);
        try {
            const data = JSON.parse(message);
            // console.log('client-connection-data', data);
            await ClientController.addConnectionData(data);
        } catch (parsingError) {
            console.error('Error parsing message:', parsingError);
        }
    })
}

export async function organizationConnectionSubscriber() {
    await RedisSingleton.getInstance().subscribe(Channel.ORGANIZATION_CONNECTION, async (message) => {
        console.log(`Received message on channel ${Channel.ORGANIZATION_CONNECTION}: `, message);
        try {
            const data = JSON.parse(message);
            // console.log('organization-connection-data', data);
            await OrganizationController.addConnectionData(data);
        } catch (parsingError) {
            console.error('Error parsing message:', parsingError);
        }
    })
}