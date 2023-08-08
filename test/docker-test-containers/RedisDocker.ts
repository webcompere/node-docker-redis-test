import DockerTestContainer from './DockerTestContainer';

const DEFAULT_REDIS_PORT = '6379';

export default class RedisDocker extends DockerTestContainer {
    constructor() {
        super(DEFAULT_REDIS_PORT, 'redis:6.2.6');
    }
}
