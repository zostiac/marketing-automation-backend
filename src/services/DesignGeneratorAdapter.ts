import { openai } from '../config/ai-providers';

export class DesignGeneratorAdapter {
  static async generateImage(prompt: string, dimensions: { width: number; height: number }): Promise<Buffer> {
    const size = this.mapDimensionsToSize(dimensions);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: 'hd',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image generated');

    const imageResponse = await fetch(imageUrl);
    return Buffer.from(await imageResponse.arrayBuffer());
  }

  private static mapDimensionsToSize(dimensions: { width: number; height: number }): string {
    const ratio = dimensions.width / dimensions.height;
    if (ratio > 1.5) return '1792x1024';
    if (ratio < 0.67) return '1024x1792';
    return '1024x1024';
  }
}