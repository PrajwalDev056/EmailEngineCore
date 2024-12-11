import { UserModel } from '../../infrastructure/persistence/documents/UserModel';
import { IElasticsearchRepository } from './IElasticSearchRepository';

export interface IUserRepository extends IElasticsearchRepository<UserModel> {
  findByEmail(query: any): Promise<UserModel | null>;
}
