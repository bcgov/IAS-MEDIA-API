import {AxiosResponse} from 'axios';
import {injectable, postConstruct} from 'inversify';
import {IIasMediaService} from './interfaces/i-ias-media-service';
import {IasMediaItem} from 'src/struct/v1/ias-media-item';

/**
 * Singleton service class.
 */
@injectable()
export class IasMediaService implements IIasMediaService {

  public constructor() {

  }

  @postConstruct()
  public init(): void {

  }

  processMediaItem(iasMediaItem: IasMediaItem): Promise<AxiosResponse<any>> {
    throw new Error('Method not implemented.');
  }

}
