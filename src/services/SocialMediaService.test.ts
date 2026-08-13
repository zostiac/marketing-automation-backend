import { describe, expect, it } from 'vitest';
import {
  buildSocialCaption,
  configuredSocialPlatforms,
  socialPlatformStatus,
} from './SocialMediaService';

describe('social caption helper', () => {
  it('joins caption and hashtags', () => {
    expect(buildSocialCaption('Hello school', ['Dashain', '#Nepal'])).toBe(
      'Hello school\n\n#Dashain #Nepal',
    );
  });

  it('returns only tags when caption is empty', () => {
    expect(buildSocialCaption('  ', ['Tihar'])).toBe('#Tihar');
  });
});

describe('configured platforms', () => {
  it('reports no platforms when credentials are absent', () => {
    expect(configuredSocialPlatforms()).toEqual([]);
    expect(socialPlatformStatus()).toEqual({
      facebook: false,
      instagram: false,
      tiktok: false,
    });
  });
});
