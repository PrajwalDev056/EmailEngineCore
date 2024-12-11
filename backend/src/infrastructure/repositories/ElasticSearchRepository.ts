import { Client } from '@elastic/elasticsearch';
import logger from '../../utils/Logger';
import { ElasticSearchDocument } from '../persistence/documents/ElasticSearchDocument';
import { PagingRequest } from '../../domain/models/PagingRequest';
import { IPagedResponse } from '../../domain/models/IPagedResponse';
import { IElasticsearchRepository } from '../../domain/interfaces/IElasticSearchRepository';

export class ElasticsearchRepository<T extends ElasticSearchDocument>
  implements IElasticsearchRepository<T>
{
  constructor(
    private client: Client,
    private indexName: string,
  ) {}

  public async create(document: T): Promise<T> {
    try {
      const response = await this.client.index({
        index: this.indexName,
        body: document,
        refresh: true,
      });

      logger.info(
        `Document created in index ${this.indexName} with ID: ${response.body._id}`,
      );
      return { ...document, id: response.body._id };
    } catch (err) {
      logger.error(`Error creating document in index ${this.indexName}:`, err);
      throw new Error('Error creating document');
    }
  }

  public async search(query: any): Promise<T[]> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: query,
      });

      logger.info(`Search query executed in index ${this.indexName}`);
      return response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
      }));
    } catch (err) {
      logger.error(
        `Error executing search query in index ${this.indexName}:`,
        err,
      );
      throw new Error('Error executing search query');
    }
  }

  public async getById(id: string): Promise<T | null> {
    try {
      const response = await this.client.get({
        index: this.indexName,
        id,
      });

      logger.info(
        `Document retrieved from index ${this.indexName} with ID: ${id}`,
      );
      return response.body
        ? { ...response.body._source, id: response.body._id }
        : null;
    } catch (err: any) {
      logger.error(
        `Error retrieving document from index ${this.indexName} with ID: ${id}`,
        err,
      );
      if (err.meta && err.meta.statusCode === 404) {
        return null;
      }
      throw new Error('Error retrieving document');
    }
  }

  public async update(id: string, document: Partial<T>): Promise<T | null> {
    try {
      const updateResult = await this.client.update({
        index: this.indexName,
        id,
        body: { doc: document },
        refresh: true,
      });

      logger.info(`Document updated in index ${this.indexName} with ID: ${id}`);
      if (updateResult.body.result === 'updated') {
        const updatedDoc = await this.getById(id);
        return updatedDoc;
      }
      return null;
    } catch (err) {
      logger.error(
        `Error updating document in index ${this.indexName} with ID: ${id}`,
        err,
      );
      throw new Error('Error updating document');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id,
        refresh: true,
      });

      logger.info(
        `Document deleted from index ${this.indexName} with ID: ${id}`,
      );
    } catch (err) {
      logger.error(
        `Error deleting document from index ${this.indexName} with ID: ${id}`,
        err,
      );
      throw new Error('Error deleting document');
    }
  }

  public async filter(
    query?: any,
    paging?: PagingRequest,
    sort?: any,
  ): Promise<IPagedResponse<T>> {
    try {
      const searchParams: any = {
        index: this.indexName,
        body: {
          query: query || { match_all: {} },
          sort: sort ? [sort] : undefined,
          from: paging?.skip || 0,
          size: paging?.limit || 10,
        },
      };

      const response = await this.client.search(searchParams);

      const list = response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
      }));

      const count = response.body.hits.total.value;

      return { count, list };
    } catch (err) {
      logger.error(
        `Failed to filter documents in index ${this.indexName}:`,
        err,
      );
      throw new Error('Error filtering documents');
    }
  }

  public async count(query: any): Promise<number> {
    try {
      const response = await this.client.count({
        index: this.indexName,
        body: { query: query || { match_all: {} } },
      });

      return response.body.count;
    } catch (err) {
      logger.error(`Error counting documents in index ${this.indexName}:`, err);
      throw new Error('Error counting documents');
    }
  }

  public async find(query: any): Promise<T[]> {
    try {
      const searchParams: any = {
        index: this.indexName,
        body: {
          query: query && Object.keys(query).length ? query : { match_all: {} },
        },
      };

      const response = await this.client.search(searchParams);

      return response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
      }));
    } catch (err) {
      logger.error(`Failed to find documents in index ${this.indexName}:`, err);
      throw new Error('Error finding documents');
    }
  }

  public async findOne(query: any): Promise<T | null> {
    try {
      const searchParams: any = {
        index: this.indexName,
        body: {
          query: query || { match_all: {} },
          size: 1,
        },
      };

      const response = await this.client.search(searchParams);

      const hit = response.body.hits.hits[0];
      return hit ? { ...hit._source, id: hit._id } : null;
    } catch (err) {
      logger.error(
        `Failed to find one document in index ${this.indexName}:`,
        err,
      );
      throw new Error('Error finding one document');
    }
  }
}
