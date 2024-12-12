/**
 * Interface for the email synchronization service.
 */
export interface IEmailSyncService {
  /**
   * Synchronizes emails for the authenticated user.
   * @param accessToken - The access token for the Microsoft Graph API.
   * @returns A promise that resolves when the synchronization is complete.
   * @throws Error if there is an issue with synchronization.
   */
  synchronizeEmails(accessToken: string): any;

  /**
   * Handles notifications for email changes.
   * @param resourceData - The notification data.
   * @param token - The access token for the Microsoft Graph API.
   * @returns A promise that resolves when the notification is handled.
   */
  handleNotification(resourceData: any, token: string): Promise<void>;
}
