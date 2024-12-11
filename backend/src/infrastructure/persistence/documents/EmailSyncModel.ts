import { ElasticSearchDocument } from './ElasticSearchDocument';

export class EmailSyncModel extends ElasticSearchDocument {
  public userId: string;
  public emailId: string;
  public subject: string;
  public body: string;
  public from: string;
  public to: string[];
  public receivedDateTime: string;
  public createdDateTime: string;
  public parentFolderId: string;
  public originalFolderId: string;
  public isRead?: boolean;
  public isFlagged?: boolean;
  public isDeleted?: boolean;
  public isMoved?: boolean;
  public isNew?: boolean;
  public lastModifiedDateTime?: string;
  public isDraft?: boolean;
  public webLink?: string;

  /**
   * EmailSync model constructor
   * @param emailId - Email ID
   * @param subject - Email subject
   * @param body - Email body
   * @param from - Sender email address
   * @param to - Recipient email addresses
   * @param receivedDateTime - Received date and time
   * @param createdDateTime - Created date and time
   * @param parentFolderId - Parent Folder Id
   * @param originalFolderId - Original Folder Id
   * @param isRead - Email Is Read
   * @param isFlagged - Email Is Flagged
   * @param isDeleted - Email Is Deleted
   * @param isMoved - Email Is Moved
   * @param isNew - Email Is New
   * @param isDraft - Email Is Draft
   * @param lastModifiedDateTime - LastModified date and time
   * @param webLink - Web Link
   */
  constructor(
    userId: string,
    emailId: string,
    subject: string,
    body: string,
    from: string,
    to: string[],
    receivedDateTime: string,
    createdDateTime: string,
    parentFolderId: string,
    originalFolderId: string,
    isRead?: boolean,
    isFlagged?: boolean,
    isDeleted?: boolean,
    isMoved?: boolean,
    isNew?: boolean,
    isDraft?: boolean,
    lastModifiedDateTime?: string,
    webLink?: string,
  ) {
    super();
    this.userId = userId;
    this.emailId = emailId;
    this.subject = subject;
    this.body = body;
    this.from = from;
    this.to = to;
    this.receivedDateTime = receivedDateTime;
    this.createdDateTime = createdDateTime;
    this.parentFolderId = parentFolderId;
    this.originalFolderId = originalFolderId;
    this.isRead = isRead;
    this.isFlagged = isFlagged;
    this.isDeleted = isDeleted;
    this.isMoved = isMoved;
    this.isNew = isNew;
    this.lastModifiedDateTime = lastModifiedDateTime;
    this.isDraft = isDraft;
    this.webLink = webLink;
  }
}
