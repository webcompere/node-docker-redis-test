import Redis, { Redis as RedisDefinition } from 'ioredis';

const ENTITY_NAME = 'myEntity';

export type Record = {
    id: string;
    value: string;
};

/**
 * Store things inside a Redis database
 */
export default class StorageService {
    private redisClient: RedisDefinition;

    /**
     * Construct with the connection details of the redis cluster
     * @param host host of the cluster
     * @param port port the cluster is listening on
     */
    constructor(host: string, port: number) {
        this.redisClient = new Redis({ port, host });
    }

    /**
     * Close the connection before terminating
     */
    public close(): void {
        this.redisClient.disconnect();
    }

    /**
     * Find the record in Redis by key
     * @param id the id of the record
     */
    public async find(id: string): Promise<Record | undefined> {
        const body = await this.redisClient.hget(ENTITY_NAME, id);
        if (!body) {
            return undefined;
        }
        return JSON.parse(body);
    }

    /**
     * Store the record in Redis according to its id
     * @param id the id
     * @param value the data
     */
    public async store(id: string, value: string): Promise<void> {
        const record: Record = {
            id,
            value,
        };

        const recordBody = JSON.stringify(record);

        await this.redisClient.multi().hset(ENTITY_NAME, id, recordBody).exec();
    }

    /**
     * Remove the given ids from the store
     * @param ids the ids to remove
     */
    public async expire(...ids: string[]): Promise<void> {
        if (!ids.length) {
            return;
        }
        await this.redisClient.hdel(ENTITY_NAME, ...ids);
    }

    public async flushall(): Promise<void> {
        await this.redisClient.flushall();
    }
}
