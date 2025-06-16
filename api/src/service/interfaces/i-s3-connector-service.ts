import {PutObjectCommandOutput} from "@aws-sdk/client-s3";

export interface IS3ConnectorService {
  downloadFileFromBucket(bucketName: string, key: string, fileLocation: String): Promise<string | null>
  uploadFileToS3(key: string, newTempFile: string): Promise<PutObjectCommandOutput>
}
