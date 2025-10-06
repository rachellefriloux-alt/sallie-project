/**
 * Content Filler
 * Fills templates with dynamic content from various sources
 */

import { ResponseTemplate } from '../models/ResponseTemplate';

export class ContentFiller {
  public async fillTemplate(
    template: ResponseTemplate,
    context: Record<string, unknown>
  ): Promise<string> {
    let filled = template.template;

    // Fill each variable
    for (const variable of template.variables) {
      const value = await this.getVariableValue(variable.name, variable.type, context);
      const placeholder = `{${variable.name}}`;
      filled = filled.replace(placeholder, value);
    }

    // Process conditional sections
    for (const conditional of template.conditionalSections) {
      const shouldInclude = this.evaluateCondition(conditional.condition, context);
      const placeholder = `{conditional:${conditional.condition}}`;
      const replacement = shouldInclude ? conditional.content : (conditional.alternateContent || '');
      filled = filled.replace(placeholder, replacement);
    }

    // Clean up any remaining placeholders
    filled = filled.replace(/\{[^}]+\}/g, '');

    return filled.trim();
  }

  private async getVariableValue(
    name: string,
    type: string,
    context: Record<string, unknown>
  ): Promise<string> {
    switch (type) {
      case 'entity':
        return this.getEntityValue(name, context);
      case 'context':
        return this.getContextValue(name, context);
      case 'memory':
        return this.getMemoryValue(name, context);
      case 'generated':
        return this.generateContent(name, context);
      default:
        return '';
    }
  }

  private getEntityValue(name: string, context: Record<string, unknown>): string {
    const entities = context.entities as Array<{ value: string }> || [];
    if (entities.length > 0) {
      return entities[0].value;
    }
    return name;
  }

  private getContextValue(name: string, context: Record<string, unknown>): string {
    return (context[name] as string) || '';
  }

  private getMemoryValue(name: string, context: Record<string, unknown>): string {
    const memories = context.memories as Record<string, string> || {};
    return memories[name] || '';
  }

  private generateContent(name: string, context: Record<string, unknown>): string {
    // Generate dynamic content based on context
    switch (name) {
      case 'description':
        return 'a fascinating topic';
      case 'opinion':
        return 'it\'s worth considering';
      case 'recommendation':
        return 'exploring your options';
      case 'reason':
        return 'it aligns with your interests';
      case 'additional_context':
        return '';
      case 'celebration_context':
        return 'You deserve this!';
      case 'result':
        return 'All set!';
      case 'interpretation':
        return context.lastMessage as string || 'what you just said';
      case 'connection':
        return 'This relates to our current discussion.';
      case 'topic_suggestion':
        return 'heard about the latest news';
      default:
        return '';
    }
  }

  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    // Simple condition evaluation
    const parts = condition.split(':');
    if (parts.length === 2) {
      const [key, value] = parts;
      return context[key] === value;
    }
    return !!context[condition];
  }
}
