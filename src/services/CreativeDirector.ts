import { openai } from '../config/ai-providers';
import { config } from '../config/env';
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
  dos: string[];
  donts: string[];
}

export class CreativeDirector {
  static async generateCreativeDirection(input: CreativeDirectionInput): Promise<CreativeDirectionOutput> {
    const prompt = `You are the best, most famous, and highest-paid graphic designer in the world — a world-class brand designer and art director working for ${input.school.name}.

Generate a professional, publication-ready creative direction for a ${input.design_type} marketing design.

School: ${input.school.name}
Event: ${input.event.name}
Description: ${input.event.description}
Event Type: ${input.event.event_type}
Target Audience: ${input.audience || 'students, parents, educators'}
Placement: ${input.platform || 'social media and print'}

School Branding:
- Colors: ${JSON.stringify(input.school.brand_colors)}
- Typography: ${JSON.stringify(input.school.typography)}
- Visual Style: ${input.school.visual_style}

Account memory (previously mentioned preferences and instructions — use these):
- Design Preferences: ${JSON.stringify(input.school.design_preferences)}
- Logo Protection Rules: ${JSON.stringify(input.school.logo_protection_rules)}
- Event Custom Instructions: ${input.event.custom_instructions || 'none'}
- Event Design Requirement: ${input.event.design_requirement || 'none'}

Requirements:
1. Create a unique, professional creative direction covering every field below.
2. Use any previously mentioned or stored preferences, brand notes, and instructions above as memory — apply them to this design. If nothing relevant was mentioned, use your world-class professional judgment.
3. In addition to the core direction, produce two explicit lists of instructions:
   - "dos": positive instructions — exactly what the design MUST do (e.g. color usage, hierarchy, logo handling, content accuracy).
   - "donts": negative instructions — exactly what the design MUST NOT do (e.g. avoid clashing colors, avoid distorting the logo, avoid clutter, avoid off-brand imagery).
4. The logo must be treated as sacred brand identity: preserve its exact shape, proportions, colors, and detail.

Return ONLY valid JSON with no markdown, in this exact shape:
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
  "mood": "emotional tone",
  "dos": ["positive instruction 1", "positive instruction 2"],
  "donts": ["negative instruction 1", "negative instruction 2"]
}`;

    const response = await openai.chat.completions.create({
      model: config.openai_chat_model,
      messages: [{
        role: 'user',
        content: prompt,
      }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    return {
      ...parsed,
      dos: Array.isArray(parsed.dos) ? parsed.dos : [],
      donts: Array.isArray(parsed.donts) ? parsed.donts : [],
    };
  }
}
