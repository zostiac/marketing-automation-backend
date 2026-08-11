import { Request, Response } from "express";
import { SocialMediaService } from "../services/SocialMediaService";

export class SocialMediaController {
  static async publishDesign(req: Request, res: Response) {
    try {
      const result = await SocialMediaService.publishToAll(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  static async publishBatch(req: Request, res: Response) {
    try {
      const posts: any[] = req.body.posts || [req.body];
      const results = [];
      for (const post of posts) {
        results.push(await SocialMediaService.publishToAll(post));
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}
