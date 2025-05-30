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
      oidc: {
        jwksUrl: process.env.JWKS_URL,
      },
    });
  }

  public static getConfig(key: string): any {
    return Configuration._nconf.get(key);
  }
}
new Configuration();
