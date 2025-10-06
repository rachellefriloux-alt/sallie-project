/**
 * Intent Recognizer Tests
 */

import { IntentRecognizer } from '../../nlu/IntentRecognizer';
import { InformationRequestType, ActionRequestType, EmotionalExpressionType, SocialInteractionType } from '../../models/Intent';

describe('IntentRecognizer', () => {
  let recognizer: IntentRecognizer;

  beforeEach(() => {
    recognizer = new IntentRecognizer();
  });

  describe('Information Requests', () => {
    test('should recognize fact request intent', async () => {
      const result = await recognizer.recognizeIntents('What is artificial intelligence?', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(InformationRequestType.FACT);
      expect(result.primaryIntent?.confidence).toBeGreaterThanOrEqual(0.6);
    });

    test('should recognize opinion request intent', async () => {
      const result = await recognizer.recognizeIntents('What do you think about climate change?', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(InformationRequestType.OPINION);
    });

    test('should recognize recommendation request intent', async () => {
      const result = await recognizer.recognizeIntents('Can you recommend a good book?', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(InformationRequestType.RECOMMENDATION);
    });

    test('should recognize explanation request intent', async () => {
      const result = await recognizer.recognizeIntents('How does photosynthesis work?', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(InformationRequestType.EXPLANATION);
    });
  });

  describe('Action Requests', () => {
    test('should recognize task request intent', async () => {
      const result = await recognizer.recognizeIntents('Can you help me with this?', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(ActionRequestType.TASK);
    });

    test('should recognize reminder request intent', async () => {
      const result = await recognizer.recognizeIntents('Remind me to call mom tomorrow', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(ActionRequestType.REMINDER);
    });

    test('should recognize search request intent', async () => {
      const result = await recognizer.recognizeIntents('Search for restaurants nearby', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(ActionRequestType.SEARCH);
    });
  });

  describe('Emotional Expressions', () => {
    test('should recognize venting intent', async () => {
      const result = await recognizer.recognizeIntents('I hate this so much', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(EmotionalExpressionType.VENTING);
    });

    test('should recognize celebrating intent', async () => {
      const result = await recognizer.recognizeIntents('I finally did it! This is amazing!', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(EmotionalExpressionType.CELEBRATING);
    });

    test('should recognize gratitude intent', async () => {
      const result = await recognizer.recognizeIntents('Thank you so much for your help', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(EmotionalExpressionType.GRATITUDE);
    });
  });

  describe('Social Interactions', () => {
    test('should recognize greeting intent', async () => {
      const result = await recognizer.recognizeIntents('Hello! How are you?', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(SocialInteractionType.GREETING);
    });

    test('should recognize farewell intent', async () => {
      const result = await recognizer.recognizeIntents('Goodbye, talk to you later', 'user1');
      
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.primaryIntent?.type).toBe(SocialInteractionType.FAREWELL);
    });
  });

  describe('Multi-intent Detection', () => {
    test('should detect multiple intents in complex messages', async () => {
      const result = await recognizer.recognizeIntents('Hello! Can you help me find a good restaurant?', 'user1');
      
      expect(result.intents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Confidence Scoring', () => {
    test('should assign high confidence to clear intents', async () => {
      const result = await recognizer.recognizeIntents('What is the capital of France?', 'user1');
      
      expect(result.primaryIntent?.confidence).toBeGreaterThan(0.7);
    });

    test('should flag ambiguous intents for clarification', async () => {
      recognizer.setConfidenceThreshold(0.8);
      const result = await recognizer.recognizeIntents('What about that?', 'user1');
      
      // Low confidence or unclear intent should be flagged
      expect(result.requiresClarification || result.primaryIntent === null).toBe(true);
    });
  });
});
