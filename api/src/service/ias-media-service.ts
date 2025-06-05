import {injectable} from 'inversify';
import {IIasMediaService} from './interfaces/i-ias-media-service';
import {IasMediaItem} from 'src/struct/v1/ias-media-item';
import log from '../components/logger';
import {FFmpeggy} from 'ffmpeggy';
import {FFprobeResult} from 'ffmpeggy/cjs/types/probeTypes';
import {S3ConnectorService} from "./s3-connector-service";
import fs from 'fs-extra';
import * as tmp from 'tmp';
import {FileResult} from "tmp";

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
    let incomingVideoFile: tmp.FileResult;
    try{
      log.info('Processing media item: ' + JSON.stringify(iasMediaItem));
      incomingVideoFile = await this._s3ConnectorService.downloadFileFromBucket(iasMediaItem.videoKey);
      let probeResult = await this.probeMediaItem(incomingVideoFile.name);

      log.info('Probe result is: ' + JSON.stringify(probeResult));

      newVideoFile = await this.runFFMpegProcessor(incomingVideoFile.name);
      await this._s3ConnectorService.uploadFileToS3(iasMediaItem.videoKey, newVideoFile.name);
    }catch(e){
      console.log('Bad: ' + e);
    }
    finally {
      newVideoFile.removeCallback();
      incomingVideoFile.removeCallback();
    }
  }

  private async probeMediaItem(vidString: string): Promise<FFprobeResult> {
    console.log(vidString);
    const ffmpeggy = new FFmpeggy({
      input: vidString
    });
    return await ffmpeggy.probe();
  }

  private async runFFMpegProcessor(vidString: string): Promise<FileResult> {
    try {
      const tmpobj = tmp.fileSync();
      console.log('File: ', tmpobj.name);

      const ffmpeggy = new FFmpeggy({
        input: vidString,
        output: fs.createWriteStream(tmpobj.name),
        outputOptions: ['-f:v h264']
      });

      await ffmpeggy.run();
      console.log('Processing is complete');
      return tmpobj;
    } catch(error) {
      console.error(`Something went wrong processing the video: ` + error);
      throw error;
    }
  }

}
