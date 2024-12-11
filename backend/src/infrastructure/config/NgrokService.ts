import AxiosWrapper from '../../utils/AxiosWrapper';
import logger from '../../utils/Logger';
import ngrok from 'ngrok';

class NgrokService {
  private static instance: NgrokService;
  public url: string | null = null;

  private constructor() {}

  public static getInstance(): NgrokService {
    if (!NgrokService.instance) {
      NgrokService.instance = new NgrokService();
    }
    return NgrokService.instance;
  }

  public async connect(port: number): Promise<string> {
    logger.info(`Environment for ngrok: ${process.env.ENVIRONMENT}`);
    if (process.env.ENVIRONMENT === 'production') {
      this.url = await this.getNgrokForProduction();
    } else {
      this.url = await this.getNgrokForDev(port);
    }
    return this.url;
  }
  public async getNgrokForProduction(): Promise<string> {
    const axiosWrapper = new AxiosWrapper('http://ngrok');
    const response = await axiosWrapper.get('http://ngrok:4040/api/tunnels');
    logger.info(`Response ${JSON.stringify(response.data)}`);
    const publicUrl = response.data.tunnels[0].public_url;
    logger.info(`Ngrok Public Url: ${publicUrl}`);
    return publicUrl;
  }

  public async getNgrokForDev(port: number): Promise<string> {
    try {
      const authToken = process.env.NGROK_AUTHTOKEN;
      console.log(`Ngrok authToken : ${authToken}`);
      if (authToken) {
        await ngrok.authtoken(authToken);
      } else {
        throw new Error('Ngrok authToken is not set in .env file');
      }

      if (!this.url) {
        this.url = await ngrok.connect(port);
        logger.info(`Ngrok tunnel established at ${this.url}`);
      }
      return this.url;
    } catch (error) {
      logger.error('Error connecting to ngrok:', error);
      throw new Error('Failed to establish ngrok tunnel');
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.url) {
        await ngrok.disconnect();
        this.url = null;
        logger.info('Ngrok tunnel disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from ngrok:', error);
      throw new Error('Failed to disconnect ngrok tunnel');
    }
  }
}

export default NgrokService;
