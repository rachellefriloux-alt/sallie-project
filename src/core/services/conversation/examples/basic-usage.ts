/**
 * Conversation System - Basic Usage Example
 * Demonstrates how to use the conversation system
 */

import { ConversationService } from '../ConversationService';

async function main() {
  console.log('\n=== Conversation System Demo ===\n');
  
  const service = new ConversationService();
  
  // Example 1: Simple greeting
  const greeting = await service.processMessage({
    userId: 'user123',
    sessionId: 'demo1',
    message: 'Hello! How are you?',
  });
  
  console.log('User: Hello! How are you?');
  console.log('Assistant:', greeting.response);
  console.log('Intent:', greeting.intent.primaryIntent?.type);
  console.log('Confidence:', greeting.confidence.toFixed(2));
  
  // Example 2: Information request
  console.log('\n--- Information Request ---\n');
  const infoRequest = await service.processMessage({
    userId: 'user123',
    sessionId: 'demo1',
    message: 'Can you recommend a good book?',
  });
  
  console.log('User: Can you recommend a good book?');
  console.log('Assistant:', infoRequest.response);
  
  console.log('\n=== Demo Complete ===\n');
}

export default main;
