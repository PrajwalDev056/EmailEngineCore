import { inject, injectable } from 'inversify';
import { IEmailSyncService } from '../interfaces/IEmailSyncService';
import crypto from 'crypto';
import logger from '../../utils/Logger';
import { TYPES } from '../../infrastructure/dependencyInjection/types';
import { IEmailSyncRepository } from '../../domain/interfaces/IEmailSyncRepository';
import NgrokService from '../../infrastructure/config/NgrokService';
import { GraphClient } from '../../infrastructure/config/GraphClient';
import { Socket } from '../../infrastructure/config/Socket';
import { EmailSyncModel } from '../../infrastructure/persistence/documents/EmailSyncModel';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

/**
 * Service for synchronizing emails and handling notifications.
 */
@injectable()
export class EmailSyncService implements IEmailSyncService {
  constructor(
    @inject(TYPES.EmailSyncRepository)
    private emailSyncRepository: IEmailSyncRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}

  /**
   * Synchronizes emails for the authenticated user.
   * @param accessToken - The access token for the Microsoft Graph API.
   * @returns A promise that resolves when the synchronization is complete.
   * @throws Error if there is an issue with synchronization.
   */
  public async synchronizeEmails(accessToken: string): Promise<void> {
    const client = GraphClient.getClient(accessToken);

    try {
      const response = await client.api('/me/messages').get();
      const emails = response.value;
      const user = await client.api('/me').get();
      const userEmail = user.mail || user.userPrincipalName;
      await this.storeEmail(userEmail, emails);
      await this.createSubscription(accessToken, userEmail);
      this.updateEmailProperties(emails);
      return emails;
    } catch (error: any) {
      throw new Error(`Error synchronizing emails: ${error?.message}`);
    }
  }

  /**
   * Handles notifications for email changes.
   * @param notification - The notification data.
   * @param accessToken - The access token for the Microsoft Graph API.
   * @returns A promise that resolves when the notification is handled.
   */
  public async handleNotification(
    notification: any,
    accessToken: string,
  ): Promise<void> {
    try {
      const { resourceData, changeType } = notification;
      const emailId = resourceData.id;
      const client = GraphClient.getClient(accessToken);
      const io = Socket.getInstance();

      switch (changeType) {
        case 'created': {
          const newEmail = await client.api(`/me/messages/${emailId}`).get();
          await this.handleCreatedNotification(emailId, newEmail, io);
          break;
        }
        case 'updated': {
          const updatedEmail = await client
            .api(`/me/messages/${emailId}`)
            .get();
          await this.handleUpdatedNotification(updatedEmail, emailId, io);
          break;
        }

        case 'deleted': {
          await this.handleDeletedNotification(emailId, io);
          break;
        }

        default:
          logger.warn(`Unhandled change type: ${changeType}`);
          break;
      }
    } catch (error) {
      logger.error('Error handling notification:', error);
    }
  }

  //#region Helper Methods

  /**
   * Updates email properties such as isFlagged, isMoved, and isNew.
   * @param emails - The list of emails to update.
   */
  private updateEmailProperties(emails: any[]) {
    emails.map((email) => {
      email.isFlagged = this.getIsFlagged(email);
      email.isMoved = this.getIsMoved(email);
      email.isNew = !email.isRead;
    });
  }

  /**
   * Determines if an email is flagged.
   * @param email - The email to check.
   * @returns True if the email is flagged, false otherwise.
   */
  private getIsFlagged(email: any): boolean {
    return email.flag?.flagStatus === 'flagged';
  }

  /**
   * Determines if an email is moved.
   * @param email - The email to check.
   * @returns True if the email is moved, false otherwise.
   */
  private getIsMoved(email: any): boolean {
    return (email.isMoved =
      email.parentFolderId != undefined &&
      email.originalFolderId != undefined &&
      email.parentFolderId !== email.originalFolderId); // Check if folders differ);
  }

  /**
   * Stores emails in the repository.
   * @param userEmail - The email address of the user.
   * @param emails - The list of emails to store.
   * @returns A promise that resolves when the emails are stored.
   */
  private async storeEmail(userEmail: string, emails: any[]): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(userEmail);
      const userId = user?.id;
      await emails.forEach(async (email: any) => {
        const emailId = email.id;
        const emailDocument = new EmailSyncModel(
          userId!,
          emailId,
          email.subject,
          email.bodyPreview,
          email.from.emailAddress.address,
          email.toRecipients.map(
            (recipient: any) => recipient.emailAddress.address,
          ),
          email.receivedDateTime,
          email.createdDateTime,
          email.parentFolderId,
          email.originalFolderId,
          email.isRead,
          email.isFlagged,
          email.isDeleted,
          email.isMoved,
          email.isNew,
        );
        await this.emailSyncRepository.createOrUpdate(emailDocument);
        logger.info(`Email stored with ID: ${email.id}`);
      });
    } catch (error: any) {
      logger.error(`Error storing email `, error.message);
    }
  }

  /**
   * Creates a subscription for email notifications.
   * @param accessToken - The access token for the Microsoft Graph API.
   * @param userEmail - The email address of the user.
   * @returns A promise that resolves when the subscription is created.
   */
  private async createSubscription(
    accessToken: string,
    userEmail: string,
  ): Promise<void> {
    const client = GraphClient.getClient(accessToken);
    const ngrokService = NgrokService.getInstance();
    const ngrokUrl = ngrokService.url;
    const subscription = {
      changeType: 'created,updated,deleted',
      notificationUrl: `${ngrokUrl}/api/email/listen?token=${encodeURIComponent(accessToken)}`,
      resource: `users/${userEmail}/messages`,
      expirationDateTime: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 2 days from now
      clientState: crypto.randomBytes(16).toString('hex'),
    };

    try {
      const response = await client.api('/subscriptions').post(subscription);
      logger.info('Subscription created: ', response);
    } catch (error) {
      logger.error('Error creating subscription: ', error);
    }
  }
  //#endregion

  //#region  Notification Helpers

  /**
   * Handles created email notifications.
   * @param emailId - The ID of the created email.
   * @param newEmail - The new email data.
   * @param io - The Socket.io instance.
   * @returns A promise that resolves when the notification is handled.
   */
  private async handleCreatedNotification(
    emailId: any,
    newEmail: any,
    io: any,
  ) {
    const existingEmail = await this.emailSyncRepository.findByEmailId(emailId);
    if (!existingEmail) {
      await this.storeEmail(newEmail.from.emailAddress.address, [newEmail]);
      io.emit('emailCreated', newEmail); // Emit event for new email
      logger.info(`Stored new email ID: ${emailId}`);
    }
  }

  /**
   * Handles updated email notifications.
   * @param updatedEmail - The updated email data.
   * @param emailId - The ID of the updated email.
   * @param io - The Socket.io instance.
   * @returns A promise that resolves when the notification is handled.
   */
  private async handleUpdatedNotification(
    updatedEmail: any,
    emailId: any,
    io: any,
  ) {
    updatedEmail.isFlagged = this.getIsFlagged(updatedEmail);
    updatedEmail.isMoved = this.getIsMoved(updatedEmail);
    updatedEmail.isNew = !updatedEmail.isRead;
    await this.storeEmail(emailId, [updatedEmail]);

    const existingEmail = await this.emailSyncRepository.findByEmailId(emailId);
    if (existingEmail) {
      const isChanged =
        existingEmail.isFlagged !== updatedEmail.isFlagged ||
        existingEmail.isMoved !== updatedEmail.isMoved ||
        existingEmail.isDeleted !== updatedEmail.isDeleted ||
        existingEmail.isRead !== updatedEmail.isRead;
      if (isChanged) {
        await this.storeEmail(updatedEmail.from.emailAddress.address, [
          updatedEmail,
        ]);
        io.emit('emailUpdated', updatedEmail); // Emit event for updated email
        logger.info(`Updated email ID: ${emailId}`);
      }
    }
  }

  /**
   * Handles deleted email notifications.
   * @param emailId - The ID of the deleted email.
   * @param io - The Socket.io instance.
   * @returns A promise that resolves when the notification is handled.
   */
  private async handleDeletedNotification(emailId: any, io: any) {
    const email = await this.emailSyncRepository.findByEmailId(emailId);
    if (email != null) {
      await this.emailSyncRepository.delete(email.id!);
      io.emit('emailDeleted', emailId); // Emit event for deleted email
      logger.info(`Deleted email ID: ${emailId}`);
    } else {
      logger.info(`Email not found with emailId: ${emailId}`);
    }
  }
  //#endregion
}
