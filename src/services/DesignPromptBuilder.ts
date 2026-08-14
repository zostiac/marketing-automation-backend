import { CreativeDirectionOutput } from './CreativeDirector';
import { School, Event } from '../models/types';

export class DesignPromptBuilder {
  static buildDesignPrompt(
    creativeDirection: CreativeDirectionOutput,
    school: School,
    event: Event,
    dimensions: { width: number; height: number }
  ): string {
    return `Create a professional ${dimensions.width}x${dimensions.height}px marketing design.

SCHOOL: ${school.name}
EVENT: ${event.name}
TYPE: ${event.event_type}
DESCRIPTION: ${event.description}

BRANDING:
- Colors: ${Object.entries(school.brand_colors || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
- Typography: ${school.typography?.primary_font || 'professional sans-serif'}
- Style: ${school.visual_style}

LOGO REQUIREMENT:
The school logo MUST be prominently displayed in the design:
- Position: top-left or center-top area
- Size: 20-30% of design
- PRESERVE: exact shape, proportions, colors, and all details
- Recognition must be clear

CREATIVE DIRECTION:
- Concept: ${creativeDirection.concept}
- Composition: ${creativeDirection.composition}
- Visual Hierarchy: ${creativeDirection.visual_hierarchy}
- Typography Style: ${creativeDirection.typography}
- Colors: ${creativeDirection.color_usage}
- Imagery: ${creativeDirection.imagery}
- Style: ${creativeDirection.illustration_style}
- Background: ${creativeDirection.background}
- Logo Integration: ${creativeDirection.logo_integration}
- Mood: ${creativeDirection.mood}

DO (positive instructions — must follow):
${(creativeDirection.dos || []).map((d) => `- ${d}`).join('\n')}

DON'T (negative instructions — must avoid):
${(creativeDirection.donts || []).map((d) => `- ${d}`).join('\n')}

Include text: "${school.name}" and "${event.name}"
Quality: High-resolution, publication-ready
Design principles: Professional, balanced, clear hierarchy`;
  }
}