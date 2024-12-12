import { Client } from '@elastic/elasticsearch';
import logger from '../../utils/Logger';
import AppConst from '../../utils/Constants';

const DEFAULT_ELASTICSEARCH_HOST = 'http://localhost:9200';
const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds

const connectElasticsearch = async (): Promise<Client> => {
  logger.info(`Initializing Elasticsearch Client...`);

  const esClientOptions: any = {
    node: AppConst.ElasticSearchHost || DEFAULT_ELASTICSEARCH_HOST,
    auth: {
      password: AppConst.ElasticSearchPassword,
      username: AppConst.ElasticSearchUserName,
    },
  };

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      logger.info(`Connecting to Elasticsearch... Attempt: ${attempts + 1}`);

      const esClient = new Client(esClientOptions);

      logger.info(`Successfully connected to Elasticsearch...`);
      const health = await esClient.cluster.health({});
      logger.info(
        `Elasticsearch connected successfully\nHealth: ${JSON.stringify(health)}`,
      );
      return esClient;
    } catch (err: any) {
      attempts++;
      logger.error(
        `Elasticsearch connection error (attempt ${attempts}):`,
        { message: err.message },
      );

      if (attempts >= MAX_RETRIES) {
        logger.error('Max retries reached. Exiting...');
        process.exit(1); // Exit the process if max retries reached
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * attempts),
      );
    }
  }
  throw new Error('Failed to connect to Elasticsearch.');
};

export default connectElasticsearch;
