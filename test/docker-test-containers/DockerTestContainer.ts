import Docker from 'dockerode';
import getPort from 'get-port';

export default class DockerTestContainer {
    private container?: Docker.Container;
    private containerHostPort?: number;
    private dockerHost?: string;
    private dockerPort?: string;
    private dockerClient?: Docker;
    private defaultContainerPort: string;
    private imageId: string;
    private environmentVariables?: { [name: string]: string };

    constructor(defaultContainerPort: string, imageId: string, environmentVariables?: { [name: string]: string }) {
        this.defaultContainerPort = defaultContainerPort;
        this.imageId = imageId;
        this.environmentVariables = environmentVariables;

        this.findHostDetails();
        this.dockerClient = new Docker({ host: this.dockerHost, port: this.dockerPort, protocol: 'http' });
    }

    /**
     * Start the container
     */
    public async createContainer(): Promise<void> {
        console.log(`Create ${this.imageId} container`);

        // don't make a second one
        if (this.container) {
            return;
        }

        this.containerHostPort = await getPort();

        const Env = this.createEnv();

        this.container = await this.dockerClient?.createContainer({
            Image: this.imageId,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            OpenStdin: false,
            StdinOnce: false,
            HostConfig: {
                PortBindings: this.createPortBindingConfig(),
            },
            Env,
        });

        try {
            await this.container?.start();
        } catch (err) {
            await this.stop();
            throw err;
        }
    }

    /**
     * Stop any running container
     */
    public async stop(): Promise<void> {
        console.log(`Stopping ${this.imageId} container`);
        if (this.container) {
            await this.container.remove({ force: true });
            console.log(`${this.imageId} Container stopped`);
            this.container = undefined;
        }
    }

    public getHost(): string {
        return this?.dockerHost || 'localhost';
    }

    public getPort(): number {
        return +(this?.containerHostPort || '0');
    }

    private findHostDetails() {
        const hostString = process.env.DOCKER_HOST;
        if (hostString) {
            this.dockerHost = hostString.split(':')[1].substr(2);
            this.dockerPort = hostString.split(':')[2];
        }
    }

    private createPortBindingConfig() {
        const portConfig: { [index: string]: any } = {};
        portConfig[`${this.defaultContainerPort}/tcp`] = [{ HostPort: String(this.containerHostPort) }];
        return portConfig;
    }

    private createEnv(): string[] | undefined {
        if (!this.environmentVariables) {
            return undefined;
        }
        return Object.entries(this.environmentVariables).map((entry) => `${entry[0]}=${entry[1]}`);
    }

    /**
     * Wait for the container to become ready
     * @param attempt the thing to attempt each time
     * @param tries the number of tries
     * @param timeBetween how long to wait for each
     */
    public static async waitFor(attempt: () => Promise<void>, tries = 20, timeBetween = 5000): Promise<void> {
        let i;
        for (i = 0; i < tries; i++) {
            try {
                await attempt();
                break;
            } catch (err) {
                // continue
                await DockerTestContainer.sleep(timeBetween);
            }
        }
        if (i === tries) {
            throw new Error('Action failed on all attempts');
        }
    }

    public static async sleep(howLong: number): Promise<void> {
        await new Promise((resolve, reject) => setTimeout(resolve, howLong));
    }
}
