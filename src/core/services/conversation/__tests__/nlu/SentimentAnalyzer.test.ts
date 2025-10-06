/**
 * Sentiment Analyzer Tests
 */

import { SentimentAnalyzer } from '../../nlu/SentimentAnalyzer';

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
  });

  describe('Basic Sentiment Detection', () => {
    test('should detect positive sentiment', async () => {
      const result = await analyzer.analyzeSentiment('I am so happy today!', 'user1');
      
      expect(result.valence).toBeGreaterThan(0);
      expect(result.primaryEmotion).toBe('happy');
    });

    test('should detect negative sentiment', async () => {
      const result = await analyzer.analyzeSentiment('I am very sad and upset', 'user1');
      
      expect(result.valence).toBeLessThan(0);
      expect(result.primaryEmotion).toBe('sad');
    });

    test('should detect neutral sentiment', async () => {
      const result = await analyzer.analyzeSentiment('The weather is okay', 'user1');
      
      expect(Math.abs(result.valence)).toBeLessThan(0.3);
    });
  });

  describe('Emotion Intensity', () => {
    test('should measure emotion intensity', async () => {
      const mildResult = await analyzer.analyzeSentiment('I am happy', 'user1');
      const intenseResult = await analyzer.analyzeSentiment('I am extremely happy!!!', 'user1');
      
      expect(intenseResult.intensity).toBeGreaterThan(mildResult.intensity);
    });
  });

  describe('Arousal Detection', () => {
    test('should detect high arousal emotions', async () => {
      const result = await analyzer.analyzeSentiment('I am so excited!', 'user1');
      
      expect(result.arousal).toBeGreaterThan(0.5);
    });

    test('should detect low arousal emotions', async () => {
      const result = await analyzer.analyzeSentiment('I feel calm and content', 'user1');
      
      expect(result.arousal).toBeLessThan(0.5);
    });
  });

  describe('Mixed Sentiment', () => {
    test('should detect mixed sentiment', async () => {
      const result = await analyzer.analyzeSentiment('I am happy but also worried', 'user1');
      
      expect(result.mixedSentiment).toBe(true);
      expect(result.emotionScores.size).toBeGreaterThan(1);
    });
  });

  describe('Negation Handling', () => {
    test('should handle negations correctly', async () => {
      const result = await analyzer.analyzeSentiment('I am not happy', 'user1');
      
      expect(result.valence).toBeLessThanOrEqual(0);
    });
  });

  describe('Target-Specific Sentiment', () => {
    test('should extract target-specific sentiment', async () => {
      const result = await analyzer.analyzeSentiment('I love pizza but hate broccoli', 'user1');
      
      expect(result.targetSpecific.size).toBeGreaterThan(0);
    });
  });
});
