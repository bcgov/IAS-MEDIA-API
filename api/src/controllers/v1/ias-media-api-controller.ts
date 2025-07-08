import express, {Request, Response, Router} from 'express';
import {constants} from 'http2';
import {injectable, inject } from 'inversify';
import {plainToClass} from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import logger from '../../components/logger';
import {IasMediaService} from '../../service/ias-media-service';
import {IIasMediaApiController} from './interfaces/i-ias-media-api-controller';
import {IasMediaItem} from '../../struct/v1/ias-media-item';
import {TYPES} from '../../config/types';
import {SecurityConfig} from '../../middleware/security-config';

@injectable()
export class IasMediaApiController implements IIasMediaApiController {

  private readonly _router: Router;
  private readonly _iasMediaService: IasMediaService;

  constructor(
    @inject(TYPES.IIasMediaService) iasMediaService: IasMediaService,
    @inject(TYPES.SecurityConfig) securityConfig: SecurityConfig
  ) {
    this._iasMediaService = iasMediaService;
    this._router = express.Router();

    this.setupRoutes(securityConfig);
  }

  /**
   * Registers all routes for this controller.
   */
  private setupRoutes(securityConfig: SecurityConfig): void {
    this._router.post(
      '/v1/media',
      securityConfig.secureRoute('post', '/v1/media'),
      this.processMediaItem.bind(this)
    );
  }

  /**
   * Handles POST /v1/media requests.
   * Validates and processes an IAS media item.
   */
  public async processMediaItem(req: Request, res: Response): Promise<void> {
    try {
      const iasMediaItem: IasMediaItem = plainToClass(IasMediaItem, req.body);
      logger.debug('Received iasMediaItem', iasMediaItem);

      const validationErrors: ValidationError[] = await validate(iasMediaItem);
      if (validationErrors.length > 0) {
        const errorTexts = validationErrors.flatMap(errorItem =>
          errorItem?.constraints ? Object.values(errorItem.constraints) : []
        );
        res.status(constants.HTTP_STATUS_BAD_REQUEST).send(errorTexts);
        return;
      }

      // Respond to the client first
      res.sendStatus(constants.HTTP_STATUS_ACCEPTED);

      // Continue processing in the background
      this._iasMediaService.processMediaItem(iasMediaItem)
        .then(() => logger.info('Media item processed successfully'))
        .catch(e => logger.error('Error processing media item:', e));
    } catch (e) {
      logger.error('Error in processMediaItem:', e);
      // Only send a response if one hasn't already been sent
      if (!res.headersSent) {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Returns the Express router for this controller.
   */
  public get Router(): Router {
    return this._router;
  }
}
