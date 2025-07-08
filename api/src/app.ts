import {Configuration} from './config/configuration';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import nocache from 'nocache';
import logger from './components/logger';
import 'reflect-metadata'; // this shim is required
import {ErrorHandlerMiddleware} from './middleware/error-handler-middleware';
import {IasMediaApiController} from './controllers/v1/ias-media-api-controller';
import {CONFIG_ELEMENT} from './config/config-element';
import {HealthCheckController} from './controllers/health-check';
import {iocContainer} from './config/ioc';
import ffmpegBin from 'ffmpeg-static';
import { path as ffprobeBin } from 'ffprobe-static';
import {FFmpeggy} from 'ffmpeggy';
import * as tmp from 'tmp';

export class App {
  public expressApplication: express.Application;

  public constructor() {
    this.expressApplication = express();
    this.expressApplication.set('trust proxy', 1);
    this.expressApplication.use(compression());
    this.expressApplication.use(cors());
    this.expressApplication.use(helmet());
    this.expressApplication.use(nocache());
    this.expressApplication.use(express.urlencoded({extended: true}));
    this.expressApplication.use(cookieParser());
    this.expressApplication.use(express.json({
      limit: Configuration.getConfig(CONFIG_ELEMENT.JSON_BODY_LIMIT),
    }));
    FFmpeggy.DefaultConfig = {
      ...FFmpeggy.DefaultConfig,
      ffprobeBin,
      ffmpegBin,
    };
    const logStream = {
      write: (message) => {
        logger.info(message);
      },
    };
    tmp.setGracefulCleanup();
    const healthCheckController = iocContainer.resolve(HealthCheckController);
    this.expressApplication.use(healthCheckController.Router);
    this.expressApplication.use(morgan(Configuration.getConfig(CONFIG_ELEMENT.MORGAN_FORMAT), {'stream': logStream}));
    this.expressApplication.use(ErrorHandlerMiddleware.handleJSONParsingErrors); // JSON formatting error handling
    // set up routing to auth and main API
    const apiRouter = express.Router();
    this.expressApplication.use(/(\/api)?/, apiRouter);
    const reportGenerationController = iocContainer.resolve(IasMediaApiController);
    apiRouter.use(reportGenerationController.Router);
    apiRouter.use(ErrorHandlerMiddleware.catchNotFoundError);
    apiRouter.use(ErrorHandlerMiddleware.handleError);
  }
}


