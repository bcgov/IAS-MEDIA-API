import {Readable} from "stream";
import {PutObjectCommandOutput} from "@aws-sdk/client-s3";

export interface IS3ConnectorService {
  downloadFileFromBucket(bucketName: string, key: string, fileLocation: String): Promise<Readable | null>
  uploadFileToS3(key: string, newVideoBuffer: Buffer): Promise<PutObjectCommandOutput>
}
