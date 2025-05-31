import {IasMediaItem} from '../../struct/v1/ias-media-item';

export interface IIasMediaService {
  processMediaItem(iasMediaItem: IasMediaItem): void
}
