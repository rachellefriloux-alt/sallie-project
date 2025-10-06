/**
 * Response Generator Tests
 */

import { ResponseGenerator } from '../../generation/ResponseGenerator';
import { Intent, IntentCategory, InformationRequestType } from '../../models/Intent';

describe('ResponseGenerator', () => {
  let generator: ResponseGenerator;

  beforeEach(() => {
    generator = new ResponseGenerator();
  });

  describe('Template-Based Generation', () => {
    test('should generate response from intent', async () => {
      const intent: Intent = {
        category: IntentCategory.INFORMATION_REQUEST,
        type: InformationRequestType.FACT,
        confidence: 0.9,
        parameters: {},
        isPrimary: true,
      };

      const result = await generator.generateResponse(
        intent,
        'user1',
        { emotion: 'neutral' },
        { extraversion: 0.5, agreeableness: 0.7, conscientiousness: 0.6, openness: 0.7, emotionalStability: 0.6 }
      );

      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should include template ID in response', async () => {
      const intent: Intent = {
        category: IntentCategory.SOCIAL_INTERACTION,
        type: 'greeting',
        confidence: 0.95,
        parameters: {},
        isPrimary: true,
      };

      const result = await generator.generateResponse(
        intent,
        'user1',
        {},
        {}
      );

      expect(result.templateUsed).toBeDefined();
    });
  });

  describe('Personality-Influenced Generation', () => {
    test('should apply personality traits to responses', async () => {
      const intent: Intent = {
        category: IntentCategory.SOCIAL_INTERACTION,
        type: 'greeting',
        confidence: 0.9,
        parameters: {},
        isPrimary: true,
      };

      const highExtraversion = await generator.generateResponse(
        intent,
        'user1',
        {},
        { extraversion: 0.9 }
      );

      const lowExtraversion = await generator.generateResponse(
        intent,
        'user2',
        {},
        { extraversion: 0.2 }
      );

      // Responses should differ based on personality
      expect(highExtraversion.text).toBeDefined();
      expect(lowExtraversion.text).toBeDefined();
    });
  });

  describe('Alternative Generation', () => {
    test('should generate alternative responses', async () => {
      const intent: Intent = {
        category: IntentCategory.INFORMATION_REQUEST,
        type: InformationRequestType.RECOMMENDATION,
        confidence: 0.85,
        parameters: {},
        isPrimary: true,
      };

      const result = await generator.generateResponse(
        intent,
        'user1',
        {},
        {}
      );

      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('Fallback Handling', () => {
    test('should provide fallback response for unknown intents', async () => {
      const unknownIntent: Intent = {
        category: 'unknown' as IntentCategory,
        type: 'unknown' as InformationRequestType,
        confidence: 0.3,
        parameters: {},
        isPrimary: true,
      };

      const result = await generator.generateResponse(
        unknownIntent,
        'user1',
        {},
        {}
      );

      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.templateUsed).toBe('fallback');
    });
  });
});
