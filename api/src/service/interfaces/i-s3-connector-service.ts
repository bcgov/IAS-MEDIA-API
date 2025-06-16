import {PutObjectCommandOutput} from '@aws-sdk/client-s3';

export interface IS3ConnectorService {
  downloadFileFromBucket(bucketName: string, key: string, fileLocation: string): Promise<string | undefined>
  uploadFileToS3(key: string, newTempFile: string): Promise<PutObjectCommandOutput>
}
