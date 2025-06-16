import {injectable} from 'inversify';
import {IIasMediaService} from './interfaces/i-ias-media-service';
import {IasMediaItem} from 'src/struct/v1/ias-media-item';
import {FFmpeggy} from 'ffmpeggy';
import {FFprobeResult} from 'ffmpeggy/cjs/types/probeTypes';
import {S3ConnectorService} from './s3-connector-service';
import log from '../components/logger';
import fs from 'fs-extra';
import * as tmp from 'tmp';
import {FileResult} from 'tmp';

/**
 * Singleton service class.
 */
@injectable()
export class IasMediaService implements IIasMediaService {

  private readonly _s3ConnectorService: S3ConnectorService;

  public constructor(s3ConnectorService: S3ConnectorService) {
    this._s3ConnectorService = s3ConnectorService;
  }

  public async processMediaItem(iasMediaItem: IasMediaItem): Promise<void> {
    let newVideoFile: tmp.FileResult;
    let incomingVideoFileName;
    try{
      log.debug('Processing media item: ' + JSON.stringify(iasMediaItem));

      log.debug('Downloading item from S3 bucket, key: ' + iasMediaItem.videoKey);
      incomingVideoFileName = await this._s3ConnectorService.downloadFileFromBucket(iasMediaItem.videoKey);

      if (incomingVideoFileName) {
        const probeResult = await this.probeMediaItem(incomingVideoFileName);
        log.debug('Probe result is: ' + JSON.stringify(probeResult));

        newVideoFile = await this.runFFMpegProcessor(incomingVideoFileName);
        await this._s3ConnectorService.uploadFileToS3(iasMediaItem.videoKey, newVideoFile.name);
      }
    } catch (error) {
      const fullError = `Error occurred while processing media item: ${error}`;
      console.error(fullError);
      throw error;
    } finally {
      newVideoFile.removeCallback();
      await fs.unlink(incomingVideoFileName);
    }
  }

  private async probeMediaItem(vidString: string): Promise<FFprobeResult> {
    try{
      const ffmpeggy = new FFmpeggy({
        input: vidString,
      });
      return await ffmpeggy.probe();
    } catch (error) {
      const fullError = `Something went wrong probing the video: ${error}`;
      console.error(fullError);
      throw error;
    }
  }

  private async runFFMpegProcessor(vidString: string): Promise<FileResult> {
    try {
      const tmpFile = tmp.fileSync();

      const ffmpeggy = new FFmpeggy({
        input: vidString,
        output: fs.createWriteStream(tmpFile.name),
        outputOptions: ['-f:v h264'],
      });

      await ffmpeggy.run();
      log.debug('Processing is complete');
      return tmpFile;
    } catch (error) {
      const fullError = `Something went wrong processing the video: ${error}`;
      console.error(fullError);
      throw error;
    }
  }

}
