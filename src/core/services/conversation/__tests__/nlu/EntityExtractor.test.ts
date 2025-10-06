/**
 * Entity Extractor Tests
 */

import { EntityExtractor } from '../../nlu/EntityExtractor';
import { EntityType } from '../../models/Entity';

describe('EntityExtractor', () => {
  let extractor: EntityExtractor;

  beforeEach(() => {
    extractor = new EntityExtractor();
  });

  describe('Person Entity Extraction', () => {
    test('should extract person names', async () => {
      const result = await extractor.extractEntities('John Smith is a great developer');
      
      const personEntities = result.entities.filter(e => e.type === EntityType.PERSON);
      expect(personEntities.length).toBeGreaterThan(0);
      expect(personEntities[0].value).toContain('John');
    });
  });

  describe('Location Entity Extraction', () => {
    test('should extract location entities', async () => {
      const result = await extractor.extractEntities('I live in New York City');
      
      const locationEntities = result.entities.filter(e => e.type === EntityType.LOCATION);
      expect(locationEntities.length).toBeGreaterThan(0);
    });
  });

  describe('Time Entity Extraction', () => {
    test('should extract time entities', async () => {
      const result = await extractor.extractEntities('Meet me at 3:00 PM tomorrow');
      
      const timeEntities = result.entities.filter(e => e.type === EntityType.TIME);
      expect(timeEntities.length).toBeGreaterThan(0);
    });

    test('should extract date entities', async () => {
      const result = await extractor.extractEntities('My birthday is tomorrow');
      
      const dateEntities = result.entities.filter(e => e.type === EntityType.DATE);
      expect(dateEntities.length).toBeGreaterThan(0);
    });
  });

  describe('Number Entity Extraction', () => {
    test('should extract numbers', async () => {
      const result = await extractor.extractEntities('I need 5 apples');
      
      const numberEntities = result.entities.filter(e => e.type === EntityType.NUMBER);
      expect(numberEntities.length).toBeGreaterThan(0);
    });

    test('should extract money amounts', async () => {
      const result = await extractor.extractEntities('The price is $99.99');
      
      const moneyEntities = result.entities.filter(e => e.type === EntityType.MONEY);
      expect(moneyEntities.length).toBeGreaterThan(0);
    });
  });

  describe('Emotion Entity Extraction', () => {
    test('should extract emotion entities', async () => {
      const result = await extractor.extractEntities('I feel happy today');
      
      const emotionEntities = result.entities.filter(e => e.type === EntityType.EMOTION);
      expect(emotionEntities.length).toBeGreaterThan(0);
      expect(emotionEntities[0].value.toLowerCase()).toBe('happy');
    });
  });

  describe('Entity Resolution', () => {
    test('should resolve entities to canonical forms', async () => {
      // First mention
      await extractor.extractEntities('John is here');
      
      // Second mention with alias
      extractor.addEntityAlias('Johnny', 'John');
      const result = await extractor.extractEntities('Johnny left');
      
      expect(result.entities.length).toBeGreaterThan(0);
    });
  });

  describe('Coreference Resolution', () => {
    test('should resolve pronouns to entities', async () => {
      const context = { focusEntity: 'Sarah' };
      const result = await extractor.extractEntities('She is a developer', context);
      
      // Should have implicit entity from context
      expect(result.entities.length).toBeGreaterThan(0);
    });
  });

  describe('Relationship Extraction', () => {
    test('should extract relationships between entities', async () => {
      const result = await extractor.extractEntities('John works at Microsoft');
      
      expect(result.relationships.size).toBeGreaterThan(0);
    });
  });
});
