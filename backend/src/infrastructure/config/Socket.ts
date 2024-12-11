import { Server as SocketIOServer } from 'socket.io';
import logger from '../../utils/Logger';
import { Server as HttpServer } from 'http';

export class Socket {
  private static io: SocketIOServer;

  public static initialize(httpServer: HttpServer): SocketIOServer {
    logger.info(`Cors origin for Socket: ${process.env.CORS_ORIGIN}`);
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      logger.info('A user connected');

      socket.on('disconnect', () => {
        logger.info('User disconnected');
      });
    });

    return this.io;
  }

  public static getInstance(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io not initialized. Call initialize() first.');
    }
    return this.io;
  }
}
