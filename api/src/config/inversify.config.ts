import { Container } from 'inversify';
import {IasMediaService} from '../service/ias-media-service';
import {HealthCheckController} from '../controllers/health-check';
import {IasMediaApiController} from '../controllers/v1/ias-media-api-controller';
import {AxiosHelper} from '../helpers/AxiosHelper';
import {AuthHandler} from '../middleware/auth-handler';
import {IAuthHandler} from '../middleware/interfaces/i-auth-handler';
import {IIasMediaApiController} from '../controllers/v1/interfaces/i-ias-media-api-controller';
import {IHealthCheckController} from '../controllers/interfaces/i-health-check';
import {IIasMediaService} from '../service/interfaces/i-ias-media-service';
import {IAxiosHelper} from '../helpers/interfaces/i-axios-helper';

const iocContainer = new Container();
iocContainer.bind<IAuthHandler>(AuthHandler).toSelf().inSingletonScope();
iocContainer.bind<IIasMediaService>(IasMediaService).toSelf().inSingletonScope();
iocContainer.bind<IHealthCheckController>(HealthCheckController).toSelf().inSingletonScope();
iocContainer.bind<IIasMediaApiController>(IasMediaApiController).toSelf().inSingletonScope();
iocContainer.bind<IAxiosHelper>(AxiosHelper).toSelf().inSingletonScope();


export { iocContainer };
