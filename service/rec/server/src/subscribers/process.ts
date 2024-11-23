import { OrganizationController } from "../controller/organization.controller";
import RedisSingleton, { Channel } from "../helper/cache";

export async function singleProcessSubscriber() {
    await RedisSingleton.getInstance().subscribe(Channel.SINGLE_PROCESS, async (message) => {
        console.log(`Received message on channel ${Channel.SINGLE_PROCESS}: `, message);
        try {
            await OrganizationController.storeSingleProcessData(message);
        } catch (parsingError) {
            console.error('Error parsing message:', parsingError);
        }
    })
}

export async function multiProcessSubscriber() {
    await RedisSingleton.getInstance().subscribe(Channel.MULTI_PROCESS, async (message) => {
        console.log(`Received message on channel ${Channel.MULTI_PROCESS}: `, message);
        try {
            await OrganizationController.storeBulkProcessData(message);
        } catch (parsingError) {
            console.error('Error parsing message:', parsingError);
        }
    })
}