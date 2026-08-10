import { openai } from '../config/ai-providers';
import { School, Event } from '../models/types';

export interface CreativeDirectionInput {
  school: School;
  event: Event;
  design_type: string;
  audience?: string;
  platform?: string;
}

export interface CreativeDirectionOutput {
  concept: string;
  composition: string;
  layout: string;
  visual_hierarchy: string;
  typography: string;
  color_usage: string;
  imagery: string;
  illustration_style: string;
  background: string;
  logo_integration: string;
  mood: string;
}

export class CreativeDirector {
  static async generateCreativeDirection(input: CreativeDirectionInput): Promise<CreativeDirectionOutput> {
    const prompt = `Generate professional creative direction for a ${input.design_type} marketing design.
    
School: ${input.school.name}
Event: ${input.event.name}
Description: ${input.event.description}
Event Type: ${input.event.event_type}

School Branding:
- Colors: ${JSON.stringify(input.school.brand_colors)}
- Typography: ${JSON.stringify(input.school.typography)}
- Visual Style: ${input.school.visual_style}

Create unique, professional creative direction. Return ONLY valid JSON:
{
  "concept": "core idea",
  "composition": "visual arrangement",
  "layout": "spatial organization",
  "visual_hierarchy": "importance ordering",
  "typography": "font treatment",
  "color_usage": "color application",
  "imagery": "visual elements",
  "illustration_style": "artistic approach",
  "background": "background treatment",
  "logo_integration": "how to integrate the school logo prominently and preserve it exactly",
  "mood": "emotional tone"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: prompt,
      }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');
    
    return JSON.parse(content);
  }
}