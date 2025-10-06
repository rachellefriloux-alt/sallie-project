/**
 * Style Mapper
 * Applies personality-influenced styling to responses
 */

export class StyleMapper {
  public applyPersonalityStyle(
    content: string,
    personalityTraits: Record<string, number>,
    context: Record<string, unknown>
  ): string {
    let styled = content;

    // Apply trait-based modifications
    styled = this.applyExtraversionStyle(styled, personalityTraits.extraversion || 0.5);
    styled = this.applyOpennessStyle(styled, personalityTraits.openness || 0.5);
    styled = this.applyAgreeablenessStyle(styled, personalityTraits.agreeableness || 0.5);
    styled = this.applyConscientiousnessStyle(styled, personalityTraits.conscientiousness || 0.5);
    styled = this.applyEmotionalStabilityStyle(styled, personalityTraits.emotionalStability || 0.5);

    return styled;
  }

  private applyExtraversionStyle(content: string, level: number): string {
    if (level > 0.7) {
      // High extraversion: more exclamation marks, enthusiastic language
      content = content.replace(/\.(\s|$)/g, '!$1');
      content = this.addEnthusiasticWords(content);
    } else if (level < 0.3) {
      // Low extraversion: more reserved, softer language
      content = content.replace(/!/g, '.');
      content = this.softenLanguage(content);
    }
    return content;
  }

  private applyOpennessStyle(content: string, level: number): string {
    if (level > 0.7) {
      // High openness: more creative expressions, metaphors
      content = this.addCreativeExpressions(content);
    }
    return content;
  }

  private applyAgreeablenessStyle(content: string, level: number): string {
    if (level > 0.7) {
      // High agreeableness: more polite, empathetic language
      if (!content.toLowerCase().includes('please') && Math.random() > 0.5) {
        content = content.replace(/^/, 'Please, ');
      }
    }
    return content;
  }

  private applyConscientiousnessStyle(content: string, level: number): string {
    if (level > 0.7) {
      // High conscientiousness: more structured, detailed
      content = this.addStructure(content);
    }
    return content;
  }

  private applyEmotionalStabilityStyle(content: string, level: number): string {
    if (level < 0.3) {
      // Low emotional stability: more cautious language
      content = this.addHedges(content);
    }
    return content;
  }

  private addEnthusiasticWords(content: string): string {
    const enthusiastic = ['absolutely', 'definitely', 'really', 'so'];
    const word = enthusiastic[Math.floor(Math.random() * enthusiastic.length)];
    
    // Insert before first adjective or verb
    const words = content.split(' ');
    if (words.length > 2) {
      words.splice(1, 0, word);
      return words.join(' ');
    }
    return content;
  }

  private softenLanguage(content: string): string {
    return content
      .replace(/\bvery\b/g, 'quite')
      .replace(/\breally\b/g, 'rather')
      .replace(/\babsolutely\b/g, 'perhaps');
  }

  private addCreativeExpressions(content: string): string {
    // Add occasional creative phrasings
    if (content.includes('good')) {
      return content.replace(/\bgood\b/, 'wonderful');
    }
    if (content.includes('bad')) {
      return content.replace(/\bbad\b/, 'challenging');
    }
    return content;
  }

  private addStructure(content: string): string {
    // Add ordinal markers if listing things
    if (content.includes(',')) {
      const parts = content.split(',');
      if (parts.length > 1) {
        return parts.map((part, i) => {
          if (i === 0) return `First, ${part.trim()}`;
          if (i === parts.length - 1) return `and finally, ${part.trim()}`;
          return `then ${part.trim()}`;
        }).join(', ');
      }
    }
    return content;
  }

  private addHedges(content: string): string {
    const hedges = ['perhaps', 'maybe', 'I think', 'it seems'];
    const hedge = hedges[Math.floor(Math.random() * hedges.length)];
    
    if (!content.toLowerCase().includes('perhaps') && 
        !content.toLowerCase().includes('maybe')) {
      return `${hedge}, ${content.charAt(0).toLowerCase()}${content.slice(1)}`;
    }
    return content;
  }
}
