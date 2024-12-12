import AxiosWrapper from '../../utils/AxiosWrapper';
import logger from '../../utils/Logger';
import ngrok from 'ngrok';

/**
 * Service class for managing Ngrok connections.
 */
class NgrokService {
  private static instance: NgrokService;
  public url: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of NgrokService.
   * @returns {NgrokService} The singleton instance.
   */
  public static getInstance(): NgrokService {
    if (!NgrokService.instance) {
      NgrokService.instance = new NgrokService();
    }
    return NgrokService.instance;
  }

  /**
   * Connect to Ngrok.
   * @param {number} port - The port to connect to.
   * @returns {Promise<string>} The Ngrok URL.
   */
  public async connect(port: number): Promise<string> {
    logger.info(`Environment for ngrok: ${process.env.ENVIRONMENT}`);
    if (process.env.ENVIRONMENT === 'production') {
      this.url = await this.getNgrokForProduction();
    } else {
      this.url = await this.getNgrokForDev(port);
    }
    return this.url;
  }

  /**
   * Get Ngrok URL for production environment.
   * @returns {Promise<string>} The Ngrok URL.
   * @throws {Error} If failed to get Ngrok URL for production.
   */
  public async getNgrokForProduction(): Promise<string> {
    try {
      const axiosWrapper = new AxiosWrapper('http://ngrok');
      const response = await axiosWrapper.get('http://ngrok:4040/api/tunnels');
      logger.info(`Response ${JSON.stringify(response.data)}`);
      const publicUrl = response.data.tunnels[0].public_url;
      logger.info(`Ngrok Public Url: ${publicUrl}`);
      return publicUrl;
    } catch (error: any) {
      logger.error('Error getting ngrok for production', {
        message: error.message,
      });
      throw new Error('Failed to get ngrok for production');
    }
  }

  /**
   * Get Ngrok URL for development environment.
   * @param {number} port - The port to connect to.
   * @returns {Promise<string>} The Ngrok URL.
   * @throws {Error} If failed to get Ngrok URL for development.
   */
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
    } catch (error: any) {
      logger.error('Error getting ngrok for dev', { message: error.message });
      throw new Error('Failed to get ngrok for dev');
    }
  }

  /**
   * Disconnect from Ngrok.
   * @returns {Promise<void>}
   * @throws {Error} If failed to disconnect Ngrok tunnel.
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.url) {
        await ngrok.disconnect();
        this.url = null;
        logger.info('Ngrok tunnel disconnected');
      }
    } catch (error: any) {
      logger.error('Error disconnecting from ngrok', {
        message: error.message,
      });
      throw new Error('Failed to disconnect ngrok tunnel');
    }
  }
}

export default NgrokService;
