import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { Client } from '@elastic/elasticsearch';
import { TYPES } from '../infrastructure/dependencyInjection/types';
import { initializeElasticSearchIndexing } from '../infrastructure/config/InitializeElasticSearchIndexing';

@controller('/elasticsearch')
export class ElasticSearchController {
  constructor(@inject(TYPES.ElasticsearchClient) private esClient: Client) {}

  @httpGet('/forcereindex')
  public async forceReIndex(req: Request, res: Response): Promise<void> {
    try {
      await initializeElasticSearchIndexing(this.esClient);
      res.status(200).json({ message: 'Indices updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update indices', error });
    }
  }
}
