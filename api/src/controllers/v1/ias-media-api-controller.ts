import express, {Request, Response} from 'express';
import {constants} from 'http2';
import logger from '../../components/logger';
import {plainToClass} from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import {IasMediaService} from '../../service/ias-media-service';
import {SCOPE} from '../../config/scope';
import {injectable} from 'inversify';
import {IIasMediaApiController} from './interfaces/i-ias-media-api-controller';
import {AuthHandler} from '../../middleware/auth-handler';
import {IasMediaItem} from '../../struct/v1/ias-media-item';

@injectable()
export class IasMediaApiController implements IIasMediaApiController {

  private readonly _router: any;
  private readonly _iasMediaService: IasMediaService;

  public constructor(iasMediaService: IasMediaService, authHandler: AuthHandler) {
    this._router = express.Router();
    this._router.post('/v1/media', authHandler.validateScope(SCOPE.PROCESS_IAS_MEDIA_ITEM), (req: Request, res: Response) => this.processMediaItem(req, res));
    this._iasMediaService = iasMediaService;
  }

  public async processMediaItem(req: Request, res: Response): Promise<void> {
    const iasMediaItem: IasMediaItem = plainToClass(IasMediaItem, req.body);
    logger.silly('Received iasMediaItem', iasMediaItem);
    const validationErrors: ValidationError[] = await validate(iasMediaItem);
    if (validationErrors?.length > 0) {
      let errorTexts = [];
      for (const errorItem of validationErrors) {
        errorTexts = errorTexts.concat(errorItem?.constraints);
      }
      res.status(constants.HTTP_STATUS_BAD_REQUEST).send(errorTexts);
      return;
    } else {
      try {
        this._iasMediaService.processMediaItem(iasMediaItem);
        res.sendStatus(constants.HTTP_STATUS_ACCEPTED);
        return;
      } catch (e) {
        logger.error(e);
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        return;
      }
    }
  }

  public get Router(): any {
    return this._router;
  }
}
