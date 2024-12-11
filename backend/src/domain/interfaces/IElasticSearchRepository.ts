import { ElasticSearchDocument } from '../../infrastructure/persistence/documents/ElasticSearchDocument';
import { IPagedResponse } from '../models/IPagedResponse';
import { PagingRequest } from '../models/PagingRequest';

export interface IElasticsearchRepository<T extends ElasticSearchDocument> {
  filter(
    query?: any,
    paging?: PagingRequest,
    sort?: any,
  ): Promise<IPagedResponse<T>>;
  getById(id: string): Promise<T | null>;
  findOne(query: any): Promise<T | null>;
  create(document: T): Promise<T>;
  update(id: string, document: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
  count(query: any): Promise<number>;
  find(query: any): Promise<T[]>;
  findOne(query: any): Promise<T | null>;
}
