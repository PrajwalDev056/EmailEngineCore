const userMappings = {
  mappings: {
    properties: {
      email: { type: 'keyword' },
      password: { type: 'text' },
      outlookToken: { type: 'text' },
      refreshToken: { type: 'text' },
    },
  },
};

export default userMappings;
