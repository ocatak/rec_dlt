import { Agent, KeyType, TypedArrayEncoder, WalletCreateKeyOptions } from "@aries-framework/core"
import { generateRandomString } from "../utils/seed"

/**
 * The function `createWalletKey` creates a new wallet key using the provided seed or private key, or
 * generates a random seed if none is provided.
 * @param {Agent} agent - The `agent` parameter is an object that represents the agent or user who is
 * creating the wallet key. It is used to interact with the wallet and perform operations such as
 * creating a key.
 * @param {WalletCreateKeyOptions} [info] - The `info` parameter is an optional object that contains
 * additional information for creating a wallet key. It has two properties:
 * @returns The function `createWalletKey` returns a promise that resolves to the result of the
 * `agent.wallet.createKey` method call.
 */
export async function createWalletKey(agent: Agent, info?: WalletCreateKeyOptions) {
  if (info?.seed) {
    return await agent.wallet.createKey({
      keyType: KeyType.Ed25519,
      seed: info.seed,
    })
  }
  if (info?.privateKey) {
    return await agent.wallet.createKey({
      keyType: KeyType.Ed25519,
      privateKey: info.privateKey,
    })
  }
  const seed = TypedArrayEncoder.fromString(generateRandomString(32))
  return await agent.wallet.createKey({
    keyType: KeyType.Ed25519,
    seed,
  })

}