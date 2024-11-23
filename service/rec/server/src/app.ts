import express, { Request, Response } from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
// works for ts-node and build run
dotenv.config({
    path: path.resolve(__dirname, '..', '..', '..', '.env')
});
import { _applicationGateWay, _FABRIC_CONFIG } from './config/fabric';
import { _SERVER_CONFIG } from './config/server';
import clientRouter from './routes/ client.routes';
import organizationRouter from './routes/organization.routes';
import { clientConnectionSubscriber, organizationConnectionSubscriber } from './subscribers/connection';
import { multiProcessSubscriber, singleProcessSubscriber } from './subscribers/process';
const app = express();
app.use(express.json());

app.use('/client', clientRouter);
app.use('/organization', organizationRouter);

app.use('/status', async (req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        message: 'Server is running'
    });
})
app.use('*', async (req: Request, res: Response) => {
    res.status(404).send({});
})
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
app.listen(_SERVER_CONFIG.port, async () => {
    try {
        await _applicationGateWay.initialize();
        console.log(`Server started at port ${_SERVER_CONFIG.port}`);
        // initialize redis with custom configuration if needed else default configuration will be used
        // subscribe to client connection channel
        await clientConnectionSubscriber();
        //subscribe to organization_connection channel
        await organizationConnectionSubscriber();
        // subcribe to single_process channel
        await singleProcessSubscriber();
        // subcribe to multi_process channel
        await multiProcessSubscriber();
    } catch (e) {
        console.error(e);
        _applicationGateWay.disconnect();
        process.exit(1);
    }
})
