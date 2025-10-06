/**
 * Response Generator
 * Main orchestrator for response generation
 */

import { TemplateEngine } from './TemplateEngine';
import { ContentFiller } from './ContentFiller';
import { StyleMapper } from './StyleMapper';
import { DiversityManager } from './DiversityManager';
import { Intent } from '../models/Intent';
import { ResponseTemplate, TemplateSelectionCriteria } from '../models/ResponseTemplate';

export interface GeneratedResponse {
  text: string;
  confidence: number;
  templateUsed: string;
  personality: Record<string, number>;
  alternatives: string[];
}

export class ResponseGenerator {
  private templateEngine: TemplateEngine;
  private contentFiller: ContentFiller;
  private styleMapper: StyleMapper;
  private diversityManager: DiversityManager;

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.contentFiller = new ContentFiller();
    this.styleMapper = new StyleMapper();
    this.diversityManager = new DiversityManager();
  }

  public async generateResponse(
    intent: Intent,
    userId: string,
    context: Record<string, unknown>,
    personalityTraits: Record<string, number>
  ): Promise<GeneratedResponse> {
    // Select template
    const criteria: TemplateSelectionCriteria = {
      intentCategory: intent.category,
      intentType: intent.type,
      emotionalContext: (context.emotion as string) || 'neutral',
      formalityPreference: 3, // Neutral by default
      personalityTraits,
      recentlyUsedTemplates: new Set(),
    };

    const template = this.templateEngine.selectTemplate(criteria, userId);

    if (!template) {
      return this.generateFallbackResponse(intent);
    }

    // Fill template with content
    const filledContent = await this.contentFiller.fillTemplate(template, context);

    // Apply personality styling
    const styledContent = this.styleMapper.applyPersonalityStyle(
      filledContent,
      personalityTraits,
      context
    );

    // Check for diversity
    const finalContent = await this.diversityManager.ensureDiversity(
      styledContent,
      userId,
      context
    );

    // Generate alternatives
    const alternatives = await this.generateAlternatives(template, context, personalityTraits);

    return {
      text: finalContent,
      confidence: intent.confidence * 0.9,
      templateUsed: template.templateId,
      personality: personalityTraits,
      alternatives,
    };
  }

  private generateFallbackResponse(intent: Intent): GeneratedResponse {
    const fallbacks = [
      'I understand. Could you tell me more about that?',
      'Interesting. What would you like me to help you with?',
      'I see. How can I assist you?',
    ];

    return {
      text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      confidence: 0.5,
      templateUsed: 'fallback',
      personality: {},
      alternatives: fallbacks,
    };
  }

  private async generateAlternatives(
    template: ResponseTemplate,
    context: Record<string, unknown>,
    personality: Record<string, number>
  ): Promise<string[]> {
    const alternatives: string[] = [];

    for (const variant of template.variants.slice(0, 2)) {
      const variantTemplate = { ...template, template: variant };
      const filled = await this.contentFiller.fillTemplate(variantTemplate, context);
      const styled = this.styleMapper.applyPersonalityStyle(filled, personality, context);
      alternatives.push(styled);
    }

    return alternatives;
  }
}
