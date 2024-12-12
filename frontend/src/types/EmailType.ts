import { Sender } from "./SenderType";

export type Email = {
  id: string;
  userId: string;
  subject: string;
  body: string;
  from: string;
  to: string[];
  receivedDateTime: any;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  sender: Sender;
  isRead: boolean;
  isNew: boolean;
  isFlagged: boolean;
  isMoved: boolean;
  isDeleted: boolean;
  isDraft?: boolean;
  bodyPreview: any;
  webLink?: string;
};
