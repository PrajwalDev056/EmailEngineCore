import { Client } from '@elastic/elasticsearch';
import logger from '../../utils/Logger';
import emailMappings from '../persistence/indices/EmailMappings';
import mailboxMappings from '../persistence/indices/MailBoxMappings';
import userMappings from '../persistence/indices/UserMappings';

/**
 * Initialize Elasticsearch
 * @returns {Promise<Client>} Elasticsearch client
 */
const initializeElasticSearchIndexing = async (
  esClient: Client,
): Promise<Client> => {
  const indices = [
    { name: 'users', body: userMappings },
    { name: 'emails', body: emailMappings },
    { name: 'mailboxes', body: mailboxMappings },
  ];

  for (const index of indices) {
    const indexExists = await esClient.indices.exists({ index: index.name });
    if (indexExists.statusCode === 404) {
      try {
        await esClient.indices.create({
          index: index.name,
          body: index.body,
        });
        logger.info(`Index "${index.name}" created successfully.`);
      } catch (err) {
        logger.error(`Error creating index "${index.name}":`, err);
        process.exit(1);
      }
    } else {
      logger.info(
        `Index "${index.name}" already exists. Updating the index...`,
      );
      // Update the index mapping if it already exists
      try {
        await esClient.indices.putMapping({
          index: index.name,
          body: index.body.mappings,
        });
        logger.info(`Index "${index.name}" updated successfully.`);
      } catch (err) {
        logger.error(`Error updating index "${index.name}":`, err);
        process.exit(1);
      }
    }
  }

  return esClient;
};

export { initializeElasticSearchIndexing };
