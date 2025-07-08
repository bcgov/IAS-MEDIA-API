/**
 * Inversify IoC Container Setup
 * Binds all interfaces to their implementations for dependency injection.
 */

import { Container } from 'inversify';
import { TYPES } from './types';

// Controllers
import { IasMediaApiController } from '../controllers/v1/ias-media-api-controller';
import { IIasMediaApiController } from '../controllers/v1/interfaces/i-ias-media-api-controller';
import { HealthCheckController } from '../controllers/health-check';
import { IHealthCheckController } from '../controllers/interfaces/i-health-check';

// Services
import { IasMediaService } from '../service/ias-media-service';
import { IIasMediaService } from '../service/interfaces/i-ias-media-service';
import { S3ConnectorService } from '../service/s3-connector-service';
import { IS3ConnectorService } from '../service/interfaces/i-s3-connector-service';

// Helpers
import { AxiosHelper } from '../helpers/AxiosHelper';
import { IAxiosHelper } from '../helpers/interfaces/i-axios-helper';

// Middleware/Security
import { IAuthHandler } from '../middleware/interfaces/i-auth-handler';
import { AuthHandler } from '../middleware/auth-handler';
import { SecurityConfig } from '../middleware/security-config';

const iocContainer = new Container();

// Controller bindings
iocContainer.bind<IIasMediaApiController>(TYPES.IIasMediaApiController).to(IasMediaApiController).inSingletonScope();
iocContainer.bind<IHealthCheckController>(TYPES.IHealthCheckController).to(HealthCheckController).inSingletonScope();

// Service bindings
iocContainer.bind<IIasMediaService>(TYPES.IIasMediaService).to(IasMediaService).inSingletonScope();
iocContainer.bind<IS3ConnectorService>(TYPES.IS3ConnectorService).to(S3ConnectorService).inSingletonScope();

// Helper bindings
iocContainer.bind<IAxiosHelper>(TYPES.IAxiosHelper).to(AxiosHelper).inSingletonScope();

// Security/Middleware bindings
iocContainer.bind<IAuthHandler>(TYPES.IAuthHandler).to(AuthHandler).inSingletonScope();
iocContainer.bind<SecurityConfig>(TYPES.SecurityConfig).to(SecurityConfig).inSingletonScope();

export { iocContainer };