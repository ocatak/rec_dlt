export * from '../../../chaincode/src/types';
export type REC_DATA_TYPE = 'raw_data' | 'sort_data';
export type REC_PAYLOAD = {
    organizationId: string;
    timestamp: number;
    dataConsumed: number;
    productionDate:{
        iso: string;
        local: string;
    },
    forcasted: number;
    production: number;
}