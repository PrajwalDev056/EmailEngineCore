const TYPES = {
  ElasticsearchClient: Symbol.for('ElasticsearchClient'),
  ElasticsearchRepository: Symbol.for('ElasticsearchRepository'),
  UserRepository: Symbol.for('UserRepository'),
  EmailSyncRepository: Symbol.for('EmailSyncRepository'),
  EmailSyncService: Symbol.for('EmailSyncService'),
  AuthService: Symbol.for('AuthService'),
  AuthController: Symbol.for('AuthController'),
  ElasticSearchController: Symbol.for('ElasticSearchController'),
  EmailController: Symbol.for('EmailController'),
};

export { TYPES };
