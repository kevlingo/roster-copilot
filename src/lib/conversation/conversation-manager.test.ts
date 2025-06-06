import { ConversationManager } from './conversation-manager';
import { parseArchetypeSelection } from './archetype-onboarding';

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    manager = new ConversationManager();
  });

  describe('Initial State', () => {
    it('should start in greeting phase', () => {
      const state = manager.getState();
      expect(state.phase).toBe('greeting');
      expect(state.selectedArchetype).toBeNull();
      expect(state.attempts).toBe(0);
    });

    it('should detect onboarding start', () => {
      expect(manager.isOnboardingStart()).toBe(true);
    });
  });

  describe('Greeting Phase', () => {
    it('should show greeting message on empty input', () => {
      const response = manager.processUserInput('');

      expect(response.message).toContain('Hi! I\'m Jake, your AI Copilot');
      expect(response.newState.phase).toBe('greeting');
    });

    it('should transition to transition-to-selection when user responds', () => {
      const response = manager.processUserInput('hello');

      expect(response.newState.phase).toBe('transition-to-selection');
    });
  });

  describe('Archetype Selection', () => {
    beforeEach(() => {
      // Move to transition-to-selection phase
      manager.processUserInput('hello');
    });

    it('should recognize archetype by name', () => {
      const response = manager.processUserInput('I want to be an Eager Learner');
      
      expect(response.newState.selectedArchetype).toBe('Eager Learner');
      expect(response.newState.phase).toBe('confirmation');
      expect(response.message).toContain('Great choice!');
    });

    it('should recognize archetype by number', () => {
      const response = manager.processUserInput('I choose number 2');
      
      expect(response.newState.selectedArchetype).toBe('Calculated Strategist');
      expect(response.newState.phase).toBe('confirmation');
    });

    it('should handle unclear responses with clarification', () => {
      const response = manager.processUserInput('I like football');

      expect(response.newState.phase).toBe('transition-to-selection');
      expect(response.message).toContain('I\'m excited to help you find your perfect archetype');
    });

    it('should show archetype selection when user says ready', () => {
      const response = manager.processUserInput('ready');

      expect(response.message).toBe(''); // No message needed - user already confirmed
      expect(response.newState.phase).toBe('archetype-selection');
      expect(response.messageType).toBe('component');
      expect(response.componentType).toBe('archetype-selection');
    });

    it('should encourage user to proceed after multiple unclear responses', () => {
      // First unclear response
      manager.processUserInput('I like football');
      // Second unclear response
      manager.processUserInput('I want to win');
      // Third unclear response
      const response = manager.processUserInput('help me');

      expect(response.message).toContain('I\'m excited to help you find your perfect archetype');
      expect(response.newState.phase).toBe('transition-to-selection');
    });
  });

  describe('Confirmation Phase', () => {
    beforeEach(() => {
      // Move to confirmation phase
      manager.processUserInput('hello');
      manager.processUserInput('Eager Learner');
    });

    it('should complete onboarding for Eager Learner with questionnaire transition', () => {
      const response = manager.processUserInput('yes');

      expect(response.newState.phase).toBe('complete');
      expect(response.shouldPersistArchetype).toBe(true);
      expect(response.shouldTransitionToNextStep).toBe(true);
      expect(response.message).toContain('quick questions');
    });

    it('should complete onboarding for other archetypes without questionnaire', () => {
      // Reset and select different archetype
      manager.reset();
      manager.processUserInput('hello');
      manager.processUserInput('Bold Playmaker');
      
      const response = manager.processUserInput('yes');
      
      expect(response.newState.phase).toBe('complete');
      expect(response.shouldPersistArchetype).toBe(true);
      expect(response.shouldTransitionToNextStep).toBe(false);
      expect(response.message).toContain('You\'re all set');
    });

    it('should allow user to change selection', () => {
      const response = manager.processUserInput('no, I want to change');
      
      expect(response.newState.phase).toBe('archetype-selection');
      expect(response.newState.selectedArchetype).toBeNull();
      expect(response.message).toContain('Let\'s find the right archetype');
    });
  });

  describe('Completion', () => {
    beforeEach(() => {
      // Complete the flow
      manager.processUserInput('hello');
      manager.processUserInput('Eager Learner');
      manager.processUserInput('yes');
    });

    it('should be marked as complete', () => {
      expect(manager.isComplete()).toBe(true);
      expect(manager.hasSelectedArchetype()).toBe(true);
    });

    it('should handle messages after completion', () => {
      const response = manager.processUserInput('thanks');
      expect(response.message).toContain('archetype selection is complete');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      // Complete a flow
      manager.processUserInput('hello');
      manager.processUserInput('Eager Learner');
      manager.processUserInput('yes');
      
      // Reset
      manager.reset();
      
      const state = manager.getState();
      expect(state.phase).toBe('greeting');
      expect(state.selectedArchetype).toBeNull();
      expect(state.attempts).toBe(0);
      expect(manager.isOnboardingStart()).toBe(true);
    });
  });
});

describe('parseArchetypeSelection', () => {
  it('should parse archetype names correctly', () => {
    expect(parseArchetypeSelection('I want to be an Eager Learner')).toBe('Eager Learner');
    expect(parseArchetypeSelection('calculated strategist please')).toBe('Calculated Strategist');
    expect(parseArchetypeSelection('Bold Playmaker sounds good')).toBe('Bold Playmaker');
    expect(parseArchetypeSelection('I am a busy optimizer')).toBe('Busy Optimizer');
  });

  it('should parse numbers correctly', () => {
    expect(parseArchetypeSelection('I choose 1')).toBe('Eager Learner');
    expect(parseArchetypeSelection('number two')).toBe('Calculated Strategist');
    expect(parseArchetypeSelection('3rd option')).toBe('Bold Playmaker');
    expect(parseArchetypeSelection('four')).toBe('Busy Optimizer');
  });

  it('should parse keywords correctly', () => {
    expect(parseArchetypeSelection('I want to learn more')).toBe('Eager Learner');
    expect(parseArchetypeSelection('I prefer data-driven decisions')).toBe('Calculated Strategist');
    expect(parseArchetypeSelection('I like taking risks')).toBe('Bold Playmaker');
    expect(parseArchetypeSelection('I am very busy')).toBe('Busy Optimizer');
  });

  it('should return null for unclear input', () => {
    expect(parseArchetypeSelection('hello there')).toBeNull();
    expect(parseArchetypeSelection('I like football')).toBeNull();
    expect(parseArchetypeSelection('help me')).toBeNull();
  });
});
