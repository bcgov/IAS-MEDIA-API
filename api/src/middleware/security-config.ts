import { injectable, inject } from 'inversify';
import { Router, Request, Response, NextFunction } from 'express';
import logger from '../components/logger';
import { IAuthHandler } from './interfaces/i-auth-handler';
import { SCOPE } from '../config/scope';
import { TYPES } from '../config/types';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface RouteSecurityConfig {
  method: HttpMethod;
  path: string;
  scopes: string[]; // Support multiple scopes
}

/**
 * Centralized security configuration for defining route-based authorization rules.
 */
@injectable()
export class SecurityConfig {
  private readonly authHandler: IAuthHandler;
  private readonly routeConfigs: RouteSecurityConfig[] = [
    {
      method: 'post',
      path: '/v1/media',
      scopes: [SCOPE.IAS_MEDIA_API],
    },
  ];

  public constructor(@inject(TYPES.IAuthHandler) authHandler: IAuthHandler) {
    this.authHandler = authHandler;
  }

  /**
   * Registers a new secured route at runtime.
   */
  public registerRoute(config: RouteSecurityConfig): void {
    this.routeConfigs.push(config);
    logger.info(`Registered secured route: [${config.method.toUpperCase()}] ${config.path}`);
  }

  /**
   * Generates middleware to secure a specific route based on its method and path.
   */
  public secureRoute(method: HttpMethod, path: string): (req: Request, res: Response, next: NextFunction) => void {
    const config = this.routeConfigs.find(
      (c) => c.method === method && c.path === path
    );

    if (!config) {
      logger.warn(`No security configuration found for ${method.toUpperCase()} ${path}`);
      return (_req: Request, res: Response, _next: NextFunction) => {
        res.status(403).json({ error: 'No security configuration for this route' });
      };
    }

    return this.authHandler.validateScope(config.scopes);
  }

  /**
   * Applies security configurations to an Express router.
   */
  public applySecurity(router: Router): void {
    this.routeConfigs.forEach((config) => {
      const method = router[config.method] as (
        path: string,
        ...handlers: Array<(req: Request, res: Response, next: NextFunction) => void | Promise<void>>
      ) => Router;

      if (typeof method === 'function') {
        method(config.path, this.authHandler.validateScope(config.scopes));
      } else {
        logger.error(`Invalid HTTP method ${config.method} in security config`);
      }
    });
  }

  /**
   * Retrieves the configured routes for inspection or testing.
   */
  public getRouteConfigs(): ReadonlyArray<RouteSecurityConfig> {
    return this.routeConfigs;
  }
}