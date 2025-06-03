import {injectable} from 'inversify';
import {IS3ConnectorService} from "./interfaces/i-s3-connector-service";
import {GetObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import {Configuration} from "../config/configuration";
import {CONFIG_ELEMENT} from "../config/config-element";

/**
 * Singleton service class.
 */
@injectable()
export class S3ConnectorService implements IS3ConnectorService {

  public async downloadFileFromBucket(key: string): Promise<Readable | null> {
    try {
      const s3 = new S3Client({
        region: "your-region",
        credentials: {
          accessKeyId: Configuration.getConfig(CONFIG_ELEMENT.S3_ACCESS_KEY_ID), // Replace with your access key ID
          secretAccessKey: Configuration.getConfig(CONFIG_ELEMENT.S3_SECRET_ACCESS_KEY), // Replace with your secret access key
        }
      });

      const command = new GetObjectCommand({
        Bucket: Configuration.getConfig(CONFIG_ELEMENT.S3_BUCKET),
        Key: key,
      });
      const response = await s3.send(command);

      if (response.Body instanceof Readable) {
        return response.Body;
      }
      return null;
    } catch (error) {
      console.error('Error reading video from S3:', error);
      return null;
    }
  };

  public async uploadFileToS3(key: string, newVideoBuffer: Buffer): Promise<PutObjectCommandOutput> {
    const client = new S3Client({
      region: "your-region", // Replace with your S3 region
      credentials: {
        accessKeyId: Configuration.getConfig(CONFIG_ELEMENT.S3_ACCESS_KEY_ID), // Replace with your access key ID
        secretAccessKey: Configuration.getConfig(CONFIG_ELEMENT.S3_SECRET_ACCESS_KEY), // Replace with your secret access key
      }
    });

    const command = new PutObjectCommand({
      Bucket: Configuration.getConfig(CONFIG_ELEMENT.S3_BUCKET),
      Key: key,
      Body: newVideoBuffer,
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
