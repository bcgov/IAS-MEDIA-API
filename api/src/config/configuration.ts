import nconf from 'nconf';
import path from 'path';

export class Configuration {
  private static _nconf: any;

  public constructor() {
    Configuration._nconf = nconf;
    const env = process.env.NODE_ENV;
    nconf.argv().file({file: path.join(__dirname, `${env}.json`)});

    nconf.defaults({
      environment: env,
      server: {
        logLevel: process.env.LOG_LEVEL,
        morganFormat: 'dev',
        port: '3000',
        bodyLimit: process.env.BODY_LIMIT,
      },
      ias: {
        jwksEndpoint: process.env.IAS_JWKS_ENDPOINT,
        clientID: process.env.IAS_CLIENT_ID,
        clientSecret: process.env.IAS_CLIENT_SECRET,
        tokenEndpoint: process.env.IAS_TOKEN_ENDPOINT,
      },
      s3: {
        accessKeyID: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
      },
    });
  }

  public static getConfig(key: string): any {
    return Configuration._nconf.get(key);
  }
}
new Configuration();
