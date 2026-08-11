import axios from 'axios';
import { AssetManager } from './AssetManager';
import { config } from '../config/env';

export interface SocialMediaPost {
  platform: 'facebook' | 'instagram' | 'tiktok';
  caption: string;
  imageStorageKey: string;
  hashtags?: string[];
  scheduledTime?: Date;
}

export class SocialMediaService {
  // Facebook Publishing
  static async publishToFacebook(post: SocialMediaPost): Promise<string> {
    try {
      const imageBuffer = await AssetManager.retrieveAsset(
        config.bucket_name,
        post.imageStorageKey
      );

      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('source', blob);
      formData.append('caption', post.caption);
      formData.append('access_token', process.env.FACEBOOK_ACCESS_TOKEN || '');

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Posted to Facebook:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Facebook post error:', error);
      throw error;
    }
  }

  // Instagram Publishing (via Business Account)
  static async publishToInstagram(post: SocialMediaPost): Promise<string> {
    try {
      const imageBuffer = await AssetManager.retrieveAsset(
        config.bucket_name,
        post.imageStorageKey
      );

      // Create media container
      const mediaResponse = await axios.post(
        `https://graph.instagram.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
        {
          image_url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
          caption: post.caption,
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
        },
      );

      // Publish media
      const publishResponse = await axios.post(
        `https://graph.instagram.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
        {
          creation_id: mediaResponse.data.id,
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
        },
      );

      console.log('Posted to Instagram:', publishResponse.data.id);
      return publishResponse.data.id;
    } catch (error) {
      console.error('Instagram post error:', error);
      throw error;
    }
  }

  // TikTok Publishing (Content Posting API v2, direct photo post)
  static async publishToTikTok(post: SocialMediaPost): Promise<string> {
    try {
      const imageBuffer = await AssetManager.retrieveAsset(
        config.bucket_name,
        post.imageStorageKey
      );

      // TikTok only accepts JPEG/WEBP for photo posts; our generated designs
      // are PNG, so they must be converted before upload (e.g. via sharp).
      if (post.imageStorageKey.toLowerCase().endsWith('.png')) {
        console.warn(
          'TikTok requires JPEG/WEBP photo posts; consider converting PNG asset:',
          post.imageStorageKey
        );
      }

      // Step 1: Initialize a direct photo post. Note: unaudited TikTok apps
      // can only publish with privacy_level SELF_ONLY until audited.
      const initResponse = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/content/init/',
        {
          media_type: 'PHOTO',
          post_mode: 'DIRECT_POST',
          post_info: {
            title: post.caption,
            privacy_level:
              process.env.TIKTOK_PRIVACY_LEVEL || 'PUBLIC_TO_EVERYONE',
          },
          source_info: {
            source: 'FILE_UPLOAD',
            photo_size: imageBuffer.length,
            chunk_size: imageBuffer.length,
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }
      );

      const { publish_id, upload_url } = initResponse.data.data;

      // Step 2: Send the image binary to the returned upload URL
      // (single-chunk upload per TikTok's media transfer guide).
      await axios.put(upload_url, imageBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Range': `bytes 0-${imageBuffer.length - 1}/${imageBuffer.length}`,
        },
      });

      console.log('Posted to TikTok:', publish_id);
      return publish_id;
    } catch (error) {
      console.error('TikTok post error:', error);
      throw error;
    }
  }

  // Batch publish to all configured platforms
  static async publishToAll(post: SocialMediaPost): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    try {
      if (process.env.FACEBOOK_ACCESS_TOKEN) {
        results.facebook = await this.publishToFacebook(post);
      }
      if (process.env.INSTAGRAM_ACCESS_TOKEN) {
        results.instagram = await this.publishToInstagram(post);
      }
      if (process.env.TIKTOK_ACCESS_TOKEN) {
        results.tiktok = await this.publishToTikTok(post);
      }
    } catch (error) {
      console.error('Social media publishing error:', error);
    }

    return results;
  }
}
