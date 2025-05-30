import {IsDefined} from 'class-validator';
import {Expose} from 'class-transformer';

export class IasMediaItem {

  @IsDefined()
  @Expose()
  public mediaQueueID: string;

  @IsDefined()
  @Expose()
  public callbackURL: string;

  @IsDefined()
  @Expose()
  public fileURL: string;

}
