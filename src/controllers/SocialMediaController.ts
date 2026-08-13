import { Request, Response } from 'express';
import {
  SocialMediaService,
  socialPlatformStatus,
} from '../services/SocialMediaService';

export class SocialMediaController {
  static getStatus(_req: Request, res: Response) {
    res.json(socialPlatformStatus());
  }

  static async publishDesign(req: Request, res: Response) {
    const platforms = req.body.platform ? [req.body.platform] : undefined;
    const result = await SocialMediaService.publishToAll(req.body, platforms);
    res.json(result);
  }

  static async publishBatch(req: Request, res: Response) {
    const posts: any[] = req.body.posts || [req.body];
    const results = [];
    for (const post of posts) {
      results.push(await SocialMediaService.publishToAll(post));
    }
    res.json(results);
  }
}
