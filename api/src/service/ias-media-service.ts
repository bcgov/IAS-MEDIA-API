import {injectable} from 'inversify';
import {IIasMediaService} from './interfaces/i-ias-media-service';
import {IasMediaItem} from 'src/struct/v1/ias-media-item';
import log from '../components/logger';

/**
 * Singleton service class.
 */
@injectable()
export class IasMediaService implements IIasMediaService {

  public processMediaItem(iasMediaItem: IasMediaItem): void {
    log.info('Processing record! Hello world.' + JSON.stringify(iasMediaItem));
  }

}
