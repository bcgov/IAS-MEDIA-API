import {injectable} from 'inversify';
import {IS3ConnectorService} from "./interfaces/i-s3-connector-service";
import {GetObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3, S3Client} from '@aws-sdk/client-s3';
import {Configuration} from "../config/configuration";
import {CONFIG_ELEMENT} from "../config/config-element";
import {Readable} from 'stream';
import * as tmp from 'tmp';
import {FileResult} from 'tmp';
import fs from 'fs-extra';

/**
 * Singleton service class.
 */
@injectable()
export class S3ConnectorService implements IS3ConnectorService {

  public async downloadFileFromBucket(key: string): Promise<FileResult | null> {
    try {
      const s3 = new S3({
        region: 'CANADA',
        endpoint: 'https://idim.objectstore.gov.bc.ca',
        credentials: {
          accessKeyId: Configuration.getConfig(CONFIG_ELEMENT.S3_ACCESS_KEY_ID),
          secretAccessKey: Configuration.getConfig(CONFIG_ELEMENT.S3_SECRET_ACCESS_KEY),
        },
        forcePathStyle: true
      });

      const command = new GetObjectCommand({
        Bucket: Configuration.getConfig(CONFIG_ELEMENT.S3_BUCKET),
        Key: key,
      });
      const response = await s3.send(command);

      if (response.Body instanceof Readable) {
        return await this.streamToTempFile(response.Body);
      }
      return null;
    } catch (error) {
      console.error('Error reading video from S3:', error);
      throw error;
    }
  };

  private async streamToTempFile(stream: Readable): Promise<FileResult> {
    const tmpFile = tmp.fileSync();
    console.log('Incoming video file temp name: ', tmpFile.name);
    let writeStream = fs.createWriteStream(tmpFile.name);
    stream.pipe(writeStream);
    return tmpFile;
  }

  public async uploadFileToS3(key: string, newTempFile: string): Promise<PutObjectCommandOutput> {
    const client = new S3Client({
      region: Configuration.getConfig(CONFIG_ELEMENT.S3_REGION),
      endpoint: 'https://idim.objectstore.gov.bc.ca',
      credentials: {
        accessKeyId: Configuration.getConfig(CONFIG_ELEMENT.S3_ACCESS_KEY_ID),
        secretAccessKey: Configuration.getConfig(CONFIG_ELEMENT.S3_SECRET_ACCESS_KEY),
      },
      forcePathStyle: true
    });

    const command = new PutObjectCommand({
      Bucket: Configuration.getConfig(CONFIG_ELEMENT.S3_BUCKET),
      Key: key,
      Body: Buffer.from(newTempFile),
    });

    try {
      const data = await client.send(command);
      console.log("File uploaded successfully:", data);
      return data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

}
