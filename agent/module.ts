import { AskarModule } from "@aries-framework/askar"
import { ConnectionsModule, DidsModule } from "@aries-framework/core"
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

export function getAskarAnonCredsIndyModules() {
    return {
        connections: new ConnectionsModule({
            autoAcceptConnections: true,
        }),
        dids: new DidsModule(),
        askar: new AskarModule({
            ariesAskar
        }),
    } as const
}
