import {IsDefined} from 'class-validator';
import {Expose} from 'class-transformer';

export class IasMediaItem {

  @IsDefined()
  @Expose()
  public verificationRequestID: string;

  @IsDefined()
  @Expose()
  public videoKey: string;

}
