import {injectable} from 'inversify';
import {IIasMediaService} from './interfaces/i-ias-media-service';
import {IasMediaItem} from 'src/struct/v1/ias-media-item';
import log from '../components/logger';
import {FFmpeggy} from 'ffmpeggy';
import {FFprobeResult} from 'ffmpeggy/cjs/types/probeTypes';
import {Readable} from 'stream';
import {S3ConnectorService} from "./s3-connector-service";
import * as fs from 'fs';
import {MemoryWritable} from '../util/memory-writable';

/**
 * Singleton service class.
 */
@injectable()
export class IasMediaService implements IIasMediaService {

  private readonly _s3ConnectorService: S3ConnectorService;

  public async processMediaItem(iasMediaItem: IasMediaItem): Promise<void> {
    log.info('Processing media item: ' + JSON.stringify(iasMediaItem));
    let fileBuffer = await this._s3ConnectorService.downloadFileFromBucket('ABC', iasMediaItem.videoKey);
    let probeResult = await this.probeMediaItem(fileBuffer);
    log.info('Probe result is: ' + JSON.stringify(probeResult));

    let newVideo = await this.runFFMpegProcessor(fileBuffer);
    await this._s3ConnectorService.uploadFileToS3('ABC', newVideo);
  }

  private async probeMediaItem(readStream: Readable): Promise<FFprobeResult> {
    const ffmpeggy = new FFmpeggy({
      input: new fs.ReadStream().wrap(readStream)
    });
    return await ffmpeggy.probe();
  }

  private async runFFMpegProcessor(readStream: Readable): Promise<Buffer> {
    try {

      const ffmpeggy = new FFmpeggy({
        autorun: true,
        input: new fs.ReadStream().wrap(readStream),
        outputOptions: ["-c:v h264"],
      });

      const stream = ffmpeggy.toStream();
      const outputStream = new MemoryWritable();
      stream.pipe(outputStream);
      return outputStream.getData();
    } catch(error) {
      console.error(`Something went wrong processing the video: ` + error);
      throw error;
    }
  }

}
