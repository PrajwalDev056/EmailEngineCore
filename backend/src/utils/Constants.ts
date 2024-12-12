const AppConst = {
  NodeEnv: process.env.NODE_ENV || '',
  Port: process.env.PORT || '',
  CorsOrigin: process.env.CORS_ORIGIN || '',
  ElasticSearchHost: process.env.ELASTICSEARCH_HOST || '',
  ElasticSearchUserName: process.env.ELASTICSEARCH_USERNAME || '',
  ElasticSearchPassword: process.env.ELASTICSEARCH_PASSWORD || '',
  OutlookClientId: process.env.OUTLOOK_CLIENT_ID || '',
  OutlookClientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
  NgrokAuthToken: process.env.NGROK_AUTHTOKEN || '',
  emailServiceName: 'emailsherlockengine',
};
export default AppConst;
