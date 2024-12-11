const mailboxMappings = {
  mappings: {
    properties: {
      userEmail: { type: 'keyword' },
      mailboxName: { type: 'text' },
      createdDateTime: { type: 'date' },
      lastUpdatedDateTime: { type: 'date' },
      totalEmails: { type: 'integer' },
      unreadEmails: { type: 'integer' },
      folderType: { type: 'keyword' },
    },
  },
};

export default mailboxMappings;
