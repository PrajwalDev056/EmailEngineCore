import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { Client } from '@elastic/elasticsearch';
import { TYPES } from '../infrastructure/dependencyInjection/types';

/**
 * @swagger
 * tags:
 *   name: HealthCheck
 *   description: Health check related endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Perform a health check
 *     tags: [HealthCheck]
 *     responses:
 *       200:
 *         description: Successfully performed health check
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the service
 *                 uptime:
 *                   type: number
 *                   description: Uptime of the service in seconds
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of the health check
 *                 elasticsearch:
 *                   type: string
 *                   description: Status of the Elasticsearch connection
 */
@controller('/health')
export class HealthCheckController {
  constructor(@inject(TYPES.ElasticsearchClient) private esClient: Client) {}

  @httpGet('/')
  public async healthCheck(req: Request, res: Response): Promise<Response> {
    const healthStatus = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      elasticsearch: await this.checkElasticsearchStatus(),
    };

    return res.json(healthStatus);
  }

  private async checkElasticsearchStatus(): Promise<string> {
    try {
      const health = await this.esClient.cluster.health({});
      return `Elasticsearch connected Successfully... Health: ${JSON.stringify(health?.body)}`;
    } catch (error) {
      return 'disconnected';
    }
  }
}
