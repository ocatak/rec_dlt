import { Agent } from "@aries-framework/core";
import { DemoAgent } from "../agents/organization";
import { CustomInvitationRespone } from "../utils/types";

export async function createInvitation(agent: DemoAgent | Agent, { domain, label }: { domain: string, label?: string }): Promise<CustomInvitationRespone> {
    try {
        const outOfBand = await agent.oob.createInvitation({
            label
        })
        // legacy invitation support sov prefix DID
        // const legacy = await agent.oob.createLegacyInvitation()
        // console.log(outOfBand.outOfBandInvitation)
        return { invitationUrl: outOfBand.outOfBandInvitation.toUrl({ domain }), invitationJson: outOfBand.outOfBandInvitation, oobId: outOfBand.id }

    } catch (e: any) {
        throw new Error(e.message)
    }
}
