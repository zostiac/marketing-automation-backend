import axios from 'axios';
import { AssetManager } from './AssetManager';
import { config } from '../config/env';

export interface SocialMediaPost {
  platform: 'facebook' | 'instagram' | 'twitter';
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

  // Twitter Publishing
  static async publishToTwitter(post: SocialMediaPost): Promise<string> {
    try {
      // Requires Twitter API v2 with media upload capability
      console.log('Twitter publishing would use Twitter API v2');
      return 'twitter_post_id';
    } catch (error) {
      console.error('Twitter post error:', error);
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
      if (process.env.TWITTER_ACCESS_TOKEN) {
        results.twitter = await this.publishToTwitter(post);
      }
    } catch (error) {
      console.error('Social media publishing error:', error);
    }

    return results;
  }
}
