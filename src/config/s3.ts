import { S3Client } from '@aws-sdk/client-s3';
import { config } from './env';

export const s3Client = new S3Client({
  region: config.bucket_region,
  endpoint: config.bucket_endpoint,
  credentials: {
    accessKeyId: config.bucket_access_key,
    secretAccessKey: config.bucket_secret_key,
  },
});