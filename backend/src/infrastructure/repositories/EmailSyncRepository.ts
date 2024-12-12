import { injectable } from 'inversify';
import { ElasticsearchRepository } from './ElasticSearchRepository';
import { Client } from '@elastic/elasticsearch';
import { IEmailSyncRepository } from '../../domain/interfaces/IEmailSyncRepository';
import AppConst from '../../utils/Constants';
import logger from '../../utils/Logger';
import { EmailSyncModel } from '../persistence/documents/EmailSyncModel';

@injectable()
export class EmailSyncRepository
  extends ElasticsearchRepository<EmailSyncModel>
  implements IEmailSyncRepository
{
  constructor() {
    super(new Client({ node: AppConst.ElasticSearchHost }), 'emails');
  }

  public async createOrUpdate(emailDocument: EmailSyncModel): Promise<void> {
    try {
      const existingEmail = await this.findByEmailId(emailDocument.emailId);
      if (!existingEmail) {
        await this.create(emailDocument);
      } else {
        await this.update(existingEmail.id!, emailDocument);
      }
    } catch (error: any) {
      logger.error('Error creating or updating email', { message: error.message });
      throw new Error('Failed to create or update email');
    }
  }

  public async findByEmailId(emailId: any): Promise<EmailSyncModel | null> {
    try {
      const body = {
        match: { emailId },
      };
      const result = await this.findOne(body);
      if (result) {
        logger.info(`Email found with emailId: ${emailId}`);
        return result;
      }
      logger.warn(`No email found with emailId: ${emailId}`);
      return null;
    } catch (error: any) {
      logger.error('Error finding email by emailId', { message: error.message });
      throw new Error('Failed to find email by emailId');
    }
  }

  public async findByUserId(userId: any): Promise<EmailSyncModel | null> {
    try {
      const body = {
        match: { userId },
      };
      const result = await this.findOne(body);
      if (result) {
        logger.info(`Email found with userId: ${userId}`);
        return result;
      }
      logger.warn(`No email found with userId: ${userId}`);
      return null;
    } catch (error: any) {
      logger.error('Error finding email by userId', { message: error.message });
      throw new Error('Failed to find email by userId');
    }
  }
}
