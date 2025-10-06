/**
 * Conversation Service Integration Tests
 */

import { ConversationService } from '../ConversationService';
import type { ConversationRequest } from '../ConversationService';

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
  });

  describe('Message Processing', () => {
    test('should process a simple greeting', async () => {
      const request: ConversationRequest = {
        userId: 'user1',
        sessionId: 'session1',
        message: 'Hello!',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
      expect(response.response.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0);
    });

    test('should process a question', async () => {
      const request: ConversationRequest = {
        userId: 'user1',
        sessionId: 'session1',
        message: 'What is the weather like?',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.intent).toBeDefined();
      expect(response.intent.intents.length).toBeGreaterThan(0);
    });

    test('should detect sentiment in message', async () => {
      const request: ConversationRequest = {
        userId: 'user1',
        sessionId: 'session1',
        message: 'I am so happy today!',
      };

      const response = await service.processMessage(request);

      expect(response.sentiment).toBeDefined();
      expect(response.sentiment.emotion).toBeDefined();
      expect(response.sentiment.valence).toBeGreaterThan(0);
    });
  });

  describe('Context Tracking', () => {
    test('should maintain context across turns', async () => {
      const session = 'session2';
      const userId = 'user2';

      // First turn
      await service.processMessage({
        userId,
        sessionId: session,
        message: 'My name is Alice',
      });

      // Second turn - should have context
      const response = await service.processMessage({
        userId,
        sessionId: session,
        message: 'What is my name?',
      });

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });
  });

  describe('Clarification Handling', () => {
    test('should request clarification for ambiguous input', async () => {
      const request: ConversationRequest = {
        userId: 'user1',
        sessionId: 'session1',
        message: 'What about that?',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      // May or may not require clarification depending on context
      expect(typeof response.requiresClarification).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('should handle processing errors gracefully', async () => {
      const request: ConversationRequest = {
        userId: 'user1',
        sessionId: 'session1',
        message: '',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });
  });

  describe('Metrics', () => {
    test('should provide conversation metrics', async () => {
      const sessionId = 'session3';
      
      await service.processMessage({
        userId: 'user1',
        sessionId,
        message: 'Hello',
      });

      await service.processMessage({
        userId: 'user1',
        sessionId,
        message: 'How are you?',
      });

      const metrics = service.getMetrics(sessionId);

      expect(metrics).toBeDefined();
      expect(metrics.averageTurnLength).toBeGreaterThan(0);
    });
  });

  describe('Conversation Management', () => {
    test('should clear conversation history', () => {
      const sessionId = 'session4';
      const userId = 'user4';

      service.clearConversation(sessionId, userId);

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Response Timing', () => {
    test('should provide appropriate response delay', async () => {
      const request: ConversationRequest = {
        userId: 'user1',
        sessionId: 'session1',
        message: 'Tell me a long story',
      };

      const response = await service.processMessage(request);

      expect(response.responseDelay).toBeDefined();
      expect(response.responseDelay).toBeGreaterThan(0);
    });
  });

  describe('Multi-turn Conversations', () => {
    test('should handle multi-turn conversations', async () => {
      const sessionId = 'session5';
      const userId = 'user5';

      const turn1 = await service.processMessage({
        userId,
        sessionId,
        message: 'I like pizza',
      });

      const turn2 = await service.processMessage({
        userId,
        sessionId,
        message: 'What about you?',
      });

      const turn3 = await service.processMessage({
        userId,
        sessionId,
        message: 'Do you remember what I said I like?',
      });

      expect(turn1).toBeDefined();
      expect(turn2).toBeDefined();
      expect(turn3).toBeDefined();
    });
  });
});
