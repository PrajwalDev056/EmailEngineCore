import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { Client } from '@elastic/elasticsearch';
import { TYPES } from '../infrastructure/dependencyInjection/types';

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
