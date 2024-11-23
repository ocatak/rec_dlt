import Redis, { RedisOptions } from 'ioredis';
export enum Channel {
    CLIENT_CONNECTION = 'client_connection',
    ORGANIZATION_CONNECTION = 'organization_connection',
    SINGLE_PROCESS = 'single_process_channel',
    MULTI_PROCESS = 'multi_process_channel',
}
class RedisSingleton {
    private static instance: RedisSingleton;
    private redisClient: Redis;
    private redisSubscriber: Redis;
    private channelCallbacks: { [channel: string]: (message: string) => void } = {};

    private constructor(options?: RedisOptions) {
        if (!options) {
            options = {
                host: 'localhost',
                port: 6379,
            };
        }
        this.redisClient = new Redis(options);
        this.redisSubscriber = new Redis(options);
        // Set up event listeners
        this.setupEventListeners();
    }
    private setupEventListeners(): void {
        this.redisClient.on('connect', () => {
            console.log('Redis client connected');
        });

        this.redisClient.on('error', (err) => {
            console.error('Redis client error:', err);
        });

        this.redisSubscriber.on('connect', () => {
            console.log('Redis subscriber connected');
        });

        this.redisSubscriber.on('error', (err) => {
            console.error('Redis subscriber error:', err);
        });
        // Handle message for all subscribed channels
        this.redisSubscriber.on('message', (channel: string, message: string) => {
            const callback = this.channelCallbacks[channel];
            if (callback) {
                callback(message);
            } else {
                console.warn(`No callback found for channel: ${channel}`);
            }
        });
    }


    public static getInstance(options?: RedisOptions): RedisSingleton {
        if (!RedisSingleton.instance) {
            return RedisSingleton.instance = new RedisSingleton(options);
        }
        // passed options will be ignored
        if (options) {
            console.warn('RedisSingleton already initialized, passed options will be ignored');
        }
        return RedisSingleton.instance;
    }

    // Set a key-value pair, ensuring value is a JSON-serializable object
    public async set<T>(key: string, value: T, ex?: number): Promise<void> {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Value must be a non-null object');
        }

        try {
            const stringValue = JSON.stringify(value);
            if (ex) {
                await this.redisClient.set(key, stringValue, 'EX', ex);
                console.log(`Set key ${key} with expiry ${ex} seconds: ${stringValue}`);
            } else {
                await this.redisClient.set(key, stringValue);
                console.log(`Set key ${key}: ${stringValue}`);
            }
        } catch (error) {
            console.error('Error setting key:', error);
            throw error;
        }
    }
    // Get the value of a key and parse it back to the original type
    public async get<T>(key: string): Promise<T | null> {
        try {
            const stringValue = await this.redisClient.get(key);
            if (stringValue === null) {
                console.log(`Key ${key} does not exist`);
                return null;
            }
            const value: T = JSON.parse(stringValue);
            console.log(`Get ${key}: `, value);
            return value;
        } catch (error) {
            console.error('Error getting key:', error);
            throw error;
        }
    }

    // Delete a key
    public async del(key: string): Promise<void> {
        try {
            await this.redisClient.del(key);
            console.log(`Deleted key "${key}"`);
        } catch (error) {
            console.error('Error deleting key:', error);
            throw error;
        }
    }

    // Publish a message to a channel
    public async publish(channel: string, message: any): Promise<void> {
        try {
            await this.redisClient.publish(channel, message);
            console.log(`Published message to channel ${channel}: ${message}`);
        } catch (error) {
            console.error('Error publishing message:', error);
            throw error;
        }
    }

    // Subscribe to a channel and listen for messages
    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        try {
            if (this.channelCallbacks[channel]) {
                throw new Error(`Already subscribed to channel ${channel}`);
            }
            await this.redisSubscriber.subscribe(channel);
            this.channelCallbacks[channel] = callback;
            console.log(`Subscribed to channel ${channel}`);
        } catch (error) {
            console.error('Error subscribing to channel:', error);
            throw error;
        }
    }
}

export default RedisSingleton;
