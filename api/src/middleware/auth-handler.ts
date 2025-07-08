import * as jose from 'jose';
import {NextFunction, Request, Response} from 'express';
import {constants} from 'http2';
import {injectable} from 'inversify';
import axios, {AxiosResponse} from 'axios';
import qs from 'qs';

import logger from '../components/logger';
import {Configuration} from '../config/configuration';
import {CONFIG_ELEMENT} from '../config/config-element';
import {IAuthHandler} from './interfaces/i-auth-handler';

@injectable()
export class AuthHandler implements IAuthHandler {

  private readonly _JWKS: jose.GetKeyFunction<jose.JWSHeaderParameters, jose.FlattenedJWSInput>;

  public constructor() {
    this._JWKS = jose.createRemoteJWKSet(new URL(Configuration.getConfig(CONFIG_ELEMENT.IAS_JWKS_ENDPOINT)));
  }

  /**
   * Middleware to validate that the JWT contains the required scope(s).
   * @param requiredScopes Required scope or array of scopes.
   */
  public validateScope(requiredScopes: string[]): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req?.headers.authorization) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      }

      const [scheme, token] = req.headers.authorization.split(' ');
      if (scheme !== 'Bearer' || !token) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }
      const tokenString = token;
      logger.debug('token', tokenString);

      try {
        const jwtVerifyResult: jose.JWTVerifyResult = await jose.jwtVerify(tokenString, this._JWKS);
        const scopeClaim = jwtVerifyResult?.payload?.scope;
        const tokenScopes: string[] = typeof scopeClaim === 'string' ? scopeClaim.split(' ') : [];

        const hasScope = requiredScopes.some(scope => tokenScopes.includes(scope));

        if (hasScope) {
          next();
        } else {
          res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
        }
      } catch (e) {
        logger.error('JWT verification failed:', e);
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      }
    };
  }

  /**
   * Retrieves an access token to call the IAS API.
   */
  public async getIASApiToken(): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(Configuration.getConfig(CONFIG_ELEMENT.IAS_TOKEN_ENDPOINT),
        qs.stringify({
          client_id: Configuration.getConfig(CONFIG_ELEMENT.IAS_CLIENT_ID),
          client_secret: Configuration.getConfig(CONFIG_ELEMENT.IAS_CLIENT_SECRET),
          grant_type: 'client_credentials',
        }), {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      logger.debug('getIASApiToken Res', response.data);
      return response?.data?.access_token;
    } catch (e) {
      logger.error('Failed to get IAS API token:', e);
      throw e;
    }
  }
}
