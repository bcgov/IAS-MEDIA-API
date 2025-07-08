export const CONFIG_ELEMENT = {
  LOG_LEVEL: 'server:logLevel',

  ENVIRONMENT: 'environment',
  PORT: 'server:port',

  IAS_CLIENT_ID: 'ias:clientID',
  IAS_CLIENT_SECRET: 'ias:clientSecret',
  IAS_TOKEN_ENDPOINT: 'ias:tokenEndpoint',
  IAS_JWKS_ENDPOINT: 'ias:jwksEndpoint',

  S3_REGION: 's3:region',
  S3_BUCKET: 's3:bucket',
  S3_ENDPOINT: 's3:endpoint',
  S3_ACCESS_KEY_ID: 's3:accessKeyID',
  S3_SECRET_ACCESS_KEY: 's3:secretAccessKey',

  JSON_BODY_LIMIT: 'server.bodyLimit',
  MORGAN_FORMAT: 'server:morganFormat',

  REDIS_PORT: 'redis:port',
  REDIS_HOST: 'redis:host',

  NATS_URL: 'messaging:natsUrl',
  NATS_MAX_RECONNECT: 'messaging:natsMaxReconnect',
};
