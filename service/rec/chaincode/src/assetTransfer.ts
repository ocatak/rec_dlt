/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { ClientConnectionUpdatePayload, OrganizationConnectionUpdatePayload, ClientRegistrationData, OrganizationRegistrationData, OrganizationDataDocType, ClientDataDocType } from './types';
import { Iterators } from 'fabric-shim';

@Info({ title: 'AssetTransfer', description: 'Smart contract for trading assets' })
export class AssetTransferContract extends Contract {

    // Stores client registration data
    @Transaction()
    public async RegisterClient(ctx: Context, id: string, data: string): Promise<void> {
        try {
            const parsedData: ClientRegistrationData = JSON.parse(data);
            await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive({ ...parsedData }))));
        } catch (err) {
            console.log(err);
        }
    }
    // stores organization registration data
    @Transaction()
    public async RegisterOrganization(ctx: Context, id: string, data: string): Promise<void> {
        try {
            const parsedData: OrganizationRegistrationData = JSON.parse(data);
            await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive({ ...parsedData }))));
        } catch (err) {
            console.log(err);
        }
    }

    @Transaction(false)
    // retrives data with docType 
    public async RetrieveSpecificDataByDocType<T = any>(ctx: Context, id: string, docType: string): Promise<T | null> {
        const data = await this.RetrieveData(ctx, id)
        if (!data) {
            return null;
        }
        if (data.docType !== docType) {
            return null;
        }
        return data;
    }

    // Retrieves data
    @Transaction(false)
    public async RetrieveData<T = any>(ctx: Context, id: string): Promise<T | null> {
        const data = await ctx.stub.getState(id);
        if (data.length === 0) {
            // throw new Error(`The client data ${id} does not exist`);
            return null;
        }
        // data is a uint8array, so we convert it to string and then parse it because it was a strigified JSON object
        return JSON.parse(data.toString());
    }

    // store rec data
    @Transaction(true)
    public async RECDataStore(ctx: Context, id: string, connectionId: string, organizationId: string, data: string, docType: string) {
        await ctx.stub.putState(
            id,
            Buffer.from(stringify(sortKeysRecursive({ connectionId, organizationId, data, docType })))
        );
        return JSON.stringify({ success: true });
    }
    // retrieve rec data
    // @Transaction(false)
    // public async RECDataRetrieve(ctx: Context, id: string) {
    //     let data = await ctx.stub.getState(id); // get the account information from chaincode state

    //     if (!data || data.length === 0) {
    //         return data = []
    //     }
    //     return data.toString();
    // }

    // Retrive client data by query
    @Transaction(false)
    public RetriveClientDataByQuery(ctx: Context, queryString: string) {
        try {
            const query = JSON.parse(queryString);
            return this.getQueryResultForQueryString(ctx, query);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    @Transaction()
    public async AddClientConnectionList(ctx: Context, id: string, payload: string): Promise<void> {
        const parsedPayload: ClientConnectionUpdatePayload = JSON.parse(payload);
        const { clientEmail, connectionId, organizationEmail, organizationName, organizationAgentEndpoint } = parsedPayload;
        // client email is used as the key
        const record = {
            clientEmail,
            connectionId,
            organizationName,
            organizationEmail,
            organizationAgentEndpoint,
            docType: ClientDataDocType.ClientConnectionData
        }

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));
    }

    @Transaction()
    public async AddOrganizationConnectionList(ctx: Context, id: string, payload: string): Promise<void> {
        try {
            const parsedPayload: OrganizationConnectionUpdatePayload = JSON.parse(payload);
            const { organizationEmail, connectionId, clientEmail, clientName, clientAgentEndpoint, type } = parsedPayload;
            const record = {
                organizationEmail,
                connectionId,
                clientName,
                clientEmail,
                clientAgentEndpoint,
                type,
                docType: OrganizationDataDocType.OrganizationConnectionData
            }
            await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        } catch (err) {
            console.error('Error in UpdateOrganizationConnectionList:', err);
            throw err; // Ensure the error is not swallowed
        }
    }
    @Transaction(false)
    public async GetAllAssetsByQuery(ctx: Context, queryString: string) {
        return this.getQueryResultForQueryString(ctx, queryString)
    }

    private async getQueryResultForQueryString(ctx: Context, queryString: string) {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const results = await this.GetAllResultByQueryIterator(resultsIterator);
        return JSON.stringify(results);
    }

    private async GetAllResultByQueryIterator(iterator: Iterators.StateQueryIterator) {
        const allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            const strValue = Buffer.from(res.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            res = await iterator.next();
        }
        return allResults;
    }

}
