import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';

export class AssetManager {
  static async storeGeneratedAsset(
    fileBuffer: Buffer,
    bucket: string,
    eventId: string,
    designType: string
  ): Promise<string> {
    const key = this.generateStorageKey(eventId, designType);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/png',
    }));

    return key;
  }

  static async retrieveAsset(bucket: string, key: string): Promise<Buffer> {
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    const chunks: Uint8Array[] = [];
    if (response.Body) {
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }
    return Buffer.concat(chunks);
  }

  private static generateStorageKey(eventId: string, designType: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const randomId = uuidv4().substring(0, 8);
    return `designs/${timestamp}/${eventId}/${designType}/${randomId}.png`;
  }
}