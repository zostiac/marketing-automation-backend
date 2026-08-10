import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { config } from './env';

const s3Config: S3ClientConfig = {
  region: config.bucket_region || 'us-east-1',
};

if (config.bucket_endpoint && config.bucket_endpoint.trim() !== '') {
  s3Config.endpoint = config.bucket_endpoint.trim();
  s3Config.forcePathStyle = true;
}

if (config.bucket_access_key && config.bucket_secret_key) {
  s3Config.credentials = {
    accessKeyId: config.bucket_access_key,
    secretAccessKey: config.bucket_secret_key,
  };
}

export const s3Client = new S3Client(s3Config);
