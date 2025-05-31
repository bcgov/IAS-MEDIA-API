import {Configuration} from '../config/configuration';
import {createRemoteJWKSet, jwtVerify, JWTVerifyResult, GetKeyFunction, JWSHeaderParameters, FlattenedJWSInput} from 'jose';
import {NextFunction, Request, Response} from 'express';
import {constants} from 'http2';
import logger from '../components/logger';
import axios, {AxiosResponse} from 'axios';
import qs from 'querystring';
import {injectable} from 'inversify';
import {IAuthHandler} from './interfaces/i-auth-handler';
import {CONFIG_ELEMENT} from '../config/config-element';

@injectable()
export class AuthHandler implements IAuthHandler {

  private readonly _JWKS: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

  public constructor() {
    this._JWKS = createRemoteJWKSet(new URL(Configuration.getConfig(CONFIG_ELEMENT.OIDC_JWKS_URL)));
  }

  public  validateScope(scope: string): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req?.headers.authorization) {
        const tokenString = req.headers.authorization.split(' ')[1];
        logger.silly('token', tokenString);
        try {
          const jwtVerifyResult: JWTVerifyResult = await jwtVerify(tokenString, this._JWKS);
          const scopes: string[] = jwtVerifyResult?.payload?.scope?.split(' ');
          if (scopes && scopes.includes(scope)) {
            next();
          } else {
            res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
          }
        } catch (e) {
          logger.error(e);
          res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        }

      } else {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      }
    };

  }

  /**
   * this function returns access token to call CDOGS API
   */
  public  async getCDOGsApiToken(): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(Configuration.getConfig(CONFIG_ELEMENT.CDOGS_TOKEN_ENDPOINT),
        qs.stringify({
          client_id: Configuration.getConfig(CONFIG_ELEMENT.CDOGS_CLIENT_ID),
          client_secret: Configuration.getConfig(CONFIG_ELEMENT.CDOGS_CLIENT_SECRET),
          grant_type: 'client_credentials',
        }), {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      logger.silly('getCDOGsApiToken Res', response.data);
      return response?.data?.access_token;
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
}
