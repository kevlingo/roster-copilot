import { ConversationManager } from './conversation-manager';
import { parseArchetypeSelection, parseModeSelection } from './archetype-onboarding';

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

    it('should transition to mode-selection when user responds', () => {
      const response = manager.processUserInput('hello');

      expect(response.newState.phase).toBe('mode-selection');
    });
  });

  describe('Mode Selection', () => {
    beforeEach(() => {
      // Move to mode-selection phase
      manager.processUserInput('hello');
    });

    it('should show mode selection options on empty input', () => {
      const response = manager.processUserInput('');

      expect(response.message).toContain('Quick Setup');
      expect(response.message).toContain('Let\'s Chat');
      expect(response.newState.phase).toBe('mode-selection');
    });

    it('should recognize quick mode selection', () => {
      const response = manager.processUserInput('Quick Setup');

      expect(response.newState.selectedMode).toBe('quick');
      expect(response.newState.phase).toBe('archetype-selection');
      expect(response.message).toContain('Here are your four Fantasy Manager Archetypes');
    });

    it('should recognize full mode selection', () => {
      const response = manager.processUserInput('Let\'s Chat');

      expect(response.newState.selectedMode).toBe('full');
      expect(response.newState.phase).toBe('transition-to-selection');
      expect(response.message).toContain('take our time');
    });

    it('should handle mode selection by number', () => {
      const quickResponse = manager.processUserInput('1');
      expect(quickResponse.newState.selectedMode).toBe('quick');

      manager.reset();
      manager.processUserInput('hello');
      const fullResponse = manager.processUserInput('2');
      expect(fullResponse.newState.selectedMode).toBe('full');
    });

    it('should ask for clarification on unclear input', () => {
      const response = manager.processUserInput('I want to start');

      expect(response.message).toContain('I want to make sure I understand');
      expect(response.newState.phase).toBe('mode-selection');
    });
  });

  describe('Express Mode Archetype Selection', () => {
    beforeEach(() => {
      // Move to express mode archetype selection
      manager.processUserInput('hello');
      manager.processUserInput('Quick Setup');
    });

    it('should recognize archetype by name in express mode', () => {
      const response = manager.processUserInput('Eager Learner');

      expect(response.newState.selectedArchetype).toBe('Eager Learner');
      expect(response.newState.phase).toBe('confirmation');
      expect(response.message).toContain('Perfect! You\'re a **Eager Learner**');
    });

    it('should recognize archetype by number in express mode', () => {
      const response = manager.processUserInput('2');

      expect(response.newState.selectedArchetype).toBe('Calculated Strategist');
      expect(response.newState.phase).toBe('confirmation');
    });

    it('should allow mode switching to full mode', () => {
      const response = manager.processUserInput('I want more details');

      expect(response.newState.selectedMode).toBe('full');
      expect(response.message).toContain('switch to the full conversation mode');
    });
  });

  describe('Full Mode Archetype Selection', () => {
    beforeEach(() => {
      // Move to full mode archetype selection
      manager.processUserInput('hello');
      manager.processUserInput('Let\'s Chat');
      manager.processUserInput('ready');
    });

    it('should recognize archetype by name in full mode', () => {
      const response = manager.processUserInput('I want to be an Eager Learner');

      expect(response.newState.selectedArchetype).toBe('Eager Learner');
      expect(response.newState.phase).toBe('confirmation');
      expect(response.message).toContain('Great choice!');
    });

    it('should handle unclear responses with clarification', () => {
      const response = manager.processUserInput('I like football');

      expect(response.newState.phase).toBe('archetype-selection');
      expect(response.message).toContain('I want to make sure I understand you correctly');
    });
  });

  describe('Confirmation Phase - Express Mode', () => {
    beforeEach(() => {
      // Move to express mode confirmation phase
      manager.processUserInput('hello');
      manager.processUserInput('Quick Setup');
      manager.processUserInput('Eager Learner');
    });

    it('should complete onboarding for Eager Learner with express questionnaire transition', () => {
      const response = manager.processUserInput('yes');

      expect(response.newState.phase).toBe('complete');
      expect(response.shouldPersistArchetype).toBe(true);
      expect(response.shouldTransitionToNextStep).toBe(true);
      expect(response.message).toContain('few quick questions');
    });

    it('should complete onboarding for other archetypes without questionnaire in express mode', () => {
      // Reset and select different archetype in express mode
      manager.reset();
      manager.processUserInput('hello');
      manager.processUserInput('Quick Setup');
      manager.processUserInput('Bold Playmaker');

      const response = manager.processUserInput('yes');

      expect(response.newState.phase).toBe('complete');
      expect(response.shouldPersistArchetype).toBe(true);
      expect(response.shouldTransitionToNextStep).toBe(false);
      expect(response.message).toContain('You\'re all set');
    });

    it('should allow user to change selection in express mode', () => {
      const response = manager.processUserInput('no, I want to change');

      expect(response.newState.phase).toBe('archetype-selection');
      expect(response.newState.selectedArchetype).toBeNull();
      expect(response.message).toContain('Here are your four Fantasy Manager Archetypes');
    });
  });

  describe('Confirmation Phase - Full Mode', () => {
    beforeEach(() => {
      // Move to full mode confirmation phase
      manager.processUserInput('hello');
      manager.processUserInput('Let\'s Chat');
      manager.processUserInput('ready');
      manager.processUserInput('Eager Learner');
    });

    it('should complete onboarding for Eager Learner with full questionnaire transition', () => {
      const response = manager.processUserInput('yes');

      expect(response.newState.phase).toBe('complete');
      expect(response.shouldPersistArchetype).toBe(true);
      expect(response.shouldTransitionToNextStep).toBe(true);
      expect(response.message).toContain('quick questions that will help me personalize');
    });

    it('should allow user to change selection in full mode', () => {
      const response = manager.processUserInput('no, I want to change');

      expect(response.newState.phase).toBe('archetype-selection');
      expect(response.newState.selectedArchetype).toBeNull();
      expect(response.message).toContain('Great! Let me introduce you to the four Fantasy Manager Archetypes');
    });
  });

  describe('Completion', () => {
    beforeEach(() => {
      // Complete the express flow
      manager.processUserInput('hello');
      manager.processUserInput('Quick Setup');
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

describe('parseModeSelection', () => {
  it('should parse quick mode correctly', () => {
    expect(parseModeSelection('Quick Setup')).toBe('quick');
    expect(parseModeSelection('quick')).toBe('quick');
    expect(parseModeSelection('1')).toBe('quick');
    expect(parseModeSelection('one')).toBe('quick');
    expect(parseModeSelection('fast')).toBe('quick');
    expect(parseModeSelection('express')).toBe('quick');
  });

  it('should parse full mode correctly', () => {
    expect(parseModeSelection('Let\'s Chat')).toBe('full');
    expect(parseModeSelection('chat')).toBe('full');
    expect(parseModeSelection('2')).toBe('full');
    expect(parseModeSelection('two')).toBe('full');
    expect(parseModeSelection('full')).toBe('full');
    expect(parseModeSelection('detailed')).toBe('full');
    expect(parseModeSelection('conversation')).toBe('full');
  });

  it('should return null for unclear input', () => {
    expect(parseModeSelection('hello')).toBeNull();
    expect(parseModeSelection('I want to start')).toBeNull();
    expect(parseModeSelection('')).toBeNull();
  });
});
