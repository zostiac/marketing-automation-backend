import axios from 'axios';
import { AssetManager } from './AssetManager';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

export interface SocialMediaPost {
  platform?: SocialPlatform;
  caption?: string;
  imageStorageKey: string;
  hashtags?: string[];
  scheduledTime?: Date;
}

export interface PlatformPublishResult {
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

export type PublishResults = Partial<Record<SocialPlatform, PlatformPublishResult>>;

const PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'tiktok'];

export function buildSocialCaption(caption?: string, hashtags?: string[]): string {
  const tags = (hashtags || [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    .join(' ');
  return [caption?.trim(), tags].filter(Boolean).join('\n\n');
}

export function configuredSocialPlatforms(): SocialPlatform[] {
  const configured: SocialPlatform[] = [];
  if (process.env.FACEBOOK_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID) {
    configured.push('facebook');
  }
  if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    configured.push('instagram');
  }
  if (process.env.TIKTOK_ACCESS_TOKEN) {
    configured.push('tiktok');
  }
  return configured;
}

export function socialPlatformStatus(): Record<SocialPlatform, boolean> {
  const configured = new Set(configuredSocialPlatforms());
  return {
    facebook: configured.has('facebook'),
    instagram: configured.has('instagram'),
    tiktok: configured.has('tiktok'),
  };
}

function axiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data) return data.slice(0, 400);
    if (data && typeof data === 'object') return JSON.stringify(data).slice(0, 400);
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

export class SocialMediaService {
  static async publishToFacebook(post: SocialMediaPost): Promise<string> {
    if (!process.env.FACEBOOK_ACCESS_TOKEN || !process.env.FACEBOOK_PAGE_ID) {
      throw AppError.badRequest('Facebook credentials are not configured');
    }

    const imageBuffer = await AssetManager.retrieveAsset(
      config.bucket_name,
      post.imageStorageKey,
    );

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('source', blob);
    formData.append('caption', buildSocialCaption(post.caption, post.hashtags));
    formData.append('access_token', process.env.FACEBOOK_ACCESS_TOKEN);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    logger.info('Posted to Facebook', { id: response.data.id });
    return response.data.id;
  }

  static async publishToInstagram(post: SocialMediaPost): Promise<string> {
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      throw AppError.badRequest('Instagram credentials are not configured');
    }

    // Instagram Graph API requires a publicly fetchable image URL, not a data URI.
    const imageUrl = await AssetManager.getSignedUrl(
      config.bucket_name,
      post.imageStorageKey,
      3600,
    );

    const mediaResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
      {
        image_url: imageUrl,
        caption: buildSocialCaption(post.caption, post.hashtags),
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      },
    );

    const publishResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
      {
        creation_id: mediaResponse.data.id,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      },
    );

    logger.info('Posted to Instagram', { id: publishResponse.data.id });
    return publishResponse.data.id;
  }

  static async publishToTikTok(post: SocialMediaPost): Promise<string> {
    if (!process.env.TIKTOK_ACCESS_TOKEN) {
      throw AppError.badRequest('TikTok credentials are not configured');
    }

    if (post.imageStorageKey.toLowerCase().endsWith('.png')) {
      throw AppError.badRequest(
        'TikTok photo posts require JPEG or WEBP. Convert the PNG asset before publishing.',
      );
    }

    const imageBuffer = await AssetManager.retrieveAsset(
      config.bucket_name,
      post.imageStorageKey,
    );

    const initResponse = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/content/init/',
      {
        media_type: 'PHOTO',
        post_mode: 'DIRECT_POST',
        post_info: {
          title: buildSocialCaption(post.caption, post.hashtags).slice(0, 150),
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
      },
    );

    const { publish_id, upload_url } = initResponse.data.data;

    await axios.put(upload_url, imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Range': `bytes 0-${imageBuffer.length - 1}/${imageBuffer.length}`,
      },
    });

    logger.info('Posted to TikTok', { id: publish_id });
    return publish_id;
  }

  static async publishToPlatform(
    platform: SocialPlatform,
    post: SocialMediaPost,
  ): Promise<string> {
    if (platform === 'facebook') return this.publishToFacebook(post);
    if (platform === 'instagram') return this.publishToInstagram(post);
    return this.publishToTikTok(post);
  }

  static async publishToAll(
    post: SocialMediaPost,
    platforms?: string[],
  ): Promise<PublishResults> {
    const requested = (platforms?.length ? platforms : PLATFORMS).filter(
      (platform): platform is SocialPlatform =>
        PLATFORMS.includes(platform as SocialPlatform),
    );
    const configured = new Set(configuredSocialPlatforms());
    const results: PublishResults = {};

    for (const platform of requested) {
      if (!configured.has(platform)) {
        results[platform] = {
          ok: false,
          skipped: true,
          error: `${platform} credentials are not configured`,
        };
        continue;
      }

      try {
        const id = await this.publishToPlatform(platform, post);
        results[platform] = { ok: true, id };
      } catch (error) {
        const message = axiosErrorMessage(error);
        logger.error('Social media publish failed', { platform, error: message });
        results[platform] = { ok: false, error: message };
      }
    }

    return results;
  }
}
