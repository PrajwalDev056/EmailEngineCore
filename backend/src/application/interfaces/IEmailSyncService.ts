export interface IEmailSyncService {
  synchronizeEmails(accessToken: string): any;
  handleNotification(resourceData: any, token: string): Promise<void>;
}
