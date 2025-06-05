import {PutObjectCommandOutput} from "@aws-sdk/client-s3";
import {FileResult} from "tmp";

export interface IS3ConnectorService {
  downloadFileFromBucket(bucketName: string, key: string, fileLocation: String): Promise<FileResult | null>
  uploadFileToS3(key: string, newTempFile: string): Promise<PutObjectCommandOutput>
}
