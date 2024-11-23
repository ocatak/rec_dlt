import { ConnectionRecord } from "@aries-framework/core";
import { DemoAgent } from "../agents/organization";
ConnectionRecord
export async function allConnection(agent: DemoAgent) {
    return await agent.connections.getAll()
}
export async function connectionById(agent: DemoAgent, id: string) {
    try {
        return await agent.connections.getById(id)

    } catch (e) {
        if (e instanceof Error) {
            throw new Error("Connection Id not found")
        }
    }
}

export async function connectionByOutOfBandId(agent: DemoAgent, oobId: string) {
    try {
        return await agent.connections.findAllByOutOfBandId(oobId)
    }
    catch (e) {
        if (e instanceof Error) {
            throw new Error("Out Of Band Id not found")
        }
    }
}
