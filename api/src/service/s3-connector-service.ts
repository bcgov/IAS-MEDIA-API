import {injectable} from 'inversify';
import {IS3ConnectorService} from './interfaces/i-s3-connector-service';
import {CompleteMultipartUploadCommandOutput, GetObjectCommand, S3, S3Client} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import {Configuration} from '../config/configuration';
import {CONFIG_ELEMENT} from '../config/config-element';
import {Readable} from 'stream';
import * as tmp from 'tmp';
import fs from 'fs-extra';
import {FileResult} from "tmp";

/**
 * Singleton service class.
 */
@injectable()
export class S3ConnectorService implements IS3ConnectorService {

  public async downloadFileFromBucket(key: string): Promise<string> {
    try {
      const s3 = new S3({
        region: Configuration.getConfig(CONFIG_ELEMENT.S3_REGION),
        endpoint: Configuration.getConfig(CONFIG_ELEMENT.S3_ENDPOINT),
        credentials: {
          accessKeyId: Configuration.getConfig(CONFIG_ELEMENT.S3_ACCESS_KEY_ID),
          secretAccessKey: Configuration.getConfig(CONFIG_ELEMENT.S3_SECRET_ACCESS_KEY),
        },
        forcePathStyle: true,
      });

      const command = new GetObjectCommand({
        Bucket: Configuration.getConfig(CONFIG_ELEMENT.S3_BUCKET),
        Key: key,
      });
      const response = await s3.send(command);

      if (response.Body instanceof Readable) {
        return await this.streamToTempFile(response.Body);
      }
      throw new Error('Could not download file - body is not readable.');
    } catch (error) {
      console.error('Error reading video from S3:', error);
      throw error;
    }
  }

  public async uploadFileToS3(key: string, newTempFile: FileResult): Promise<CompleteMultipartUploadCommandOutput> {
    const client = new S3Client({
      region: Configuration.getConfig(CONFIG_ELEMENT.S3_REGION),
      endpoint: Configuration.getConfig(CONFIG_ELEMENT.S3_ENDPOINT),
      credentials: {
        accessKeyId: Configuration.getConfig(CONFIG_ELEMENT.S3_ACCESS_KEY_ID),
        secretAccessKey: Configuration.getConfig(CONFIG_ELEMENT.S3_SECRET_ACCESS_KEY),
      },
      forcePathStyle: true,
    });

    try {

      const fileBuffer = await fs.readFile(newTempFile.name);
      const upload = new Upload({
        client,
        params: {
          Bucket: Configuration.getConfig(CONFIG_ELEMENT.S3_BUCKET),
          Key: key,
          Body: fileBuffer,
        },
      });

      return await upload.done();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  private async streamToTempFile(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      tmp.file((err, tmpPath, fd, cleanupCallback) => {
        if (err) {
          reject(err);
          return;
        }

        const writeStream = fs.createWriteStream(tmpPath);
        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          resolve(tmpPath);
        });

        writeStream.on('error', (error) => {
          cleanupCallback(); // Clean up the temporary file on error
          reject(error);
        });
      });
    });
  }
}
