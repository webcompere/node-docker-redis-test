# node-docker-redis-test
Example of how to test redis in a NodeJS TypeScript project

The `StorageService` is a simple redis consuming client using `ioredis`.

This is tested using `StorageService.test.ts` which, rather than mocking `ioredis` instead stands up a redis container.

For the redis container, the `docker-test-containers` module in the `test` directory contains a `DockerTestContainer` base class, which can be used to build any docker container. This uses `dockerode` under the hood.

The `RedisDocker` class is a subclass of `DockerTestContainer` which supplies the base implementation with the details it needs to make a redis container suitable for this application.

The test code is pretty quick to execute.

The boilerplate for set up of the redis cluster:

```ts
const redisDocker = new RedisDocker();
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
  // this purges all records, giving us a clean container, which is cheaper than starting a new one each time
  await storageService.flushall();
});
```
