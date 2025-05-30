import {AxiosResponse} from 'axios';
import {injectable} from 'inversify';
import {IIasMediaService} from './interfaces/i-ias-media-service';
import {IasMediaItem} from 'src/struct/v1/ias-media-item';
import log from "../components/logger";

/**
 * Singleton service class.
 */
@injectable()
export class IasMediaService implements IIasMediaService {

  processMediaItem(iasMediaItem: IasMediaItem): Promise<AxiosResponse<any>> {
    log.info('Processing record! Hello world.');
    throw new Error('Method not implemented.');
  }

}
