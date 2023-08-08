import StorageService from '@/StorageService';
import RedisDocker from './docker-test-containers/RedisDocker';

import { randomUUID } from 'crypto';

describe('Lead service', () => {
    const redisDocker = new RedisDocker();
    const now = new Date().getTime();
    let storageService: StorageService;

    beforeAll(async () => {
        await redisDocker.createContainer();
        storageService = new StorageService(redisDocker.getHost(), redisDocker.getPort());
    });

    afterAll(async () => {
        await redisDocker.stop();
        await storageService.close();
    });

    beforeEach(async () => {
        await storageService.flushall();
    });

    it('Cannot find unknown record', async () => {
        const unknown = randomUUID().toString();

        expect(await storageService.find(unknown)).toBeUndefined();
    });

    it('Will find a record it just stored', async () => {
        const id = randomUUID().toString();

        const value = 'foo';

        await storageService.store(id, value);

        expect(await storageService.find(id)).toMatchObject({ id, value });
    });

    it('Will not find an expired record', async () => {
        const id = randomUUID().toString();

        const value = 'foo';

        await storageService.store(id, value);
        await storageService.expire(id);

        expect(await storageService.find(id)).toBeUndefined();
    });
});
