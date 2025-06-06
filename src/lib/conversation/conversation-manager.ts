// Conversation Manager for Archetype Onboarding
// Handles conversation state and flow logic

import {
  ConversationState,
  CONVERSATION_SCRIPTS,
  parseArchetypeSelection,
  getArchetypeByName,
  isRequestingMoreInfo,
  getArchetypeDetailedExplanation
} from './archetype-onboarding';

export interface ConversationResponse {
  message: string;
  newState: ConversationState;
  shouldPersistArchetype?: boolean;
  shouldTransitionToNextStep?: boolean;
  isError?: boolean;
}

export class ConversationManager {
  private state: ConversationState;

  constructor(initialState?: Partial<ConversationState>) {
    this.state = {
      phase: 'greeting',
      selectedArchetype: null,
      lastUserInput: '',
      attempts: 0,
      ...initialState
    };
  }

  // Get current conversation state
  getState(): ConversationState {
    return { ...this.state };
  }

  // Update conversation state
  setState(newState: Partial<ConversationState>): void {
    this.state = { ...this.state, ...newState };
  }

  // Check if this is the start of onboarding conversation
  isOnboardingStart(): boolean {
    return this.state.phase === 'greeting';
  }

  // Process user input and return appropriate response
  processUserInput(userInput: string): ConversationResponse {
    this.state.lastUserInput = userInput;

    switch (this.state.phase) {
      case 'greeting':
        return this.handleGreeting();
      
      case 'archetype-presentation':
        return this.handleArchetypePresentation(userInput);
      
      case 'archetype-selection':
        return this.handleArchetypeSelection(userInput);
      
      case 'confirmation':
        return this.handleConfirmation(userInput);
      
      case 'complete':
        return this.handleComplete();
      
      default:
        return this.handleError();
    }
  }

  // Handle initial greeting phase
  private handleGreeting(): ConversationResponse {
    this.state.phase = 'archetype-presentation';
    
    return {
      message: CONVERSATION_SCRIPTS.greeting,
      newState: { ...this.state }
    };
  }

  // Handle archetype presentation phase
  private handleArchetypePresentation(userInput: string): ConversationResponse {
    // Check if user is asking for more information
    if (isRequestingMoreInfo(userInput)) {
      return {
        message: CONVERSATION_SCRIPTS.archetypePresentation,
        newState: { ...this.state }
      };
    }

    // Try to parse archetype selection
    const selectedArchetype = parseArchetypeSelection(userInput);
    
    if (selectedArchetype) {
      this.state.selectedArchetype = selectedArchetype;
      this.state.phase = 'confirmation';
      
      const archetype = getArchetypeByName(selectedArchetype);
      const confirmationMessage = archetype ? archetype.confirmationMessage : 'Great choice!';
      
      return {
        message: confirmationMessage + '\n\nIs this correct? Just say "yes" to confirm, or let me know if you\'d like to choose a different archetype.',
        newState: { ...this.state }
      };
    }

    // If we can't parse the selection, present the archetypes
    this.state.phase = 'archetype-selection';
    this.state.attempts = 1;
    
    return {
      message: CONVERSATION_SCRIPTS.archetypePresentation,
      newState: { ...this.state }
    };
  }

  // Handle archetype selection phase
  private handleArchetypeSelection(userInput: string): ConversationResponse {
    // Check if user is requesting more info about a specific archetype
    if (isRequestingMoreInfo(userInput)) {
      // Try to determine which archetype they want info about
      const archetypeForInfo = parseArchetypeSelection(userInput);
      if (archetypeForInfo) {
        return {
          message: getArchetypeDetailedExplanation(archetypeForInfo),
          newState: { ...this.state }
        };
      }
      
      return {
        message: "I'd be happy to explain any of the archetypes in more detail! Which one would you like to know more about? You can say something like 'tell me more about Eager Learner' or 'explain the Bold Playmaker'.",
        newState: { ...this.state }
      };
    }

    // Try to parse archetype selection
    const selectedArchetype = parseArchetypeSelection(userInput);
    
    if (selectedArchetype) {
      this.state.selectedArchetype = selectedArchetype;
      this.state.phase = 'confirmation';
      this.state.attempts = 0;
      
      const archetype = getArchetypeByName(selectedArchetype);
      const confirmationMessage = archetype ? archetype.confirmationMessage : 'Great choice!';
      
      return {
        message: confirmationMessage + '\n\nIs this correct? Just say "yes" to confirm, or let me know if you\'d like to choose a different archetype.',
        newState: { ...this.state }
      };
    }

    // Increment attempts and provide appropriate response
    this.state.attempts++;
    
    if (this.state.attempts >= 3) {
      // After 3 attempts, provide more structured guidance
      return {
        message: CONVERSATION_SCRIPTS.invalidSelection,
        newState: { ...this.state }
      };
    } else {
      // First few attempts, provide gentle clarification
      return {
        message: CONVERSATION_SCRIPTS.clarificationRequest,
        newState: { ...this.state }
      };
    }
  }

  // Handle confirmation phase
  private handleConfirmation(userInput: string): ConversationResponse {
    const input = userInput.toLowerCase().trim();
    
    // Check for confirmation
    if (input.includes('yes') || input.includes('correct') || input.includes('confirm') || 
        input.includes('that\'s right') || input.includes('yep') || input.includes('yeah')) {
      
      this.state.phase = 'complete';
      
      // Determine next step based on archetype
      if (this.state.selectedArchetype === 'Eager Learner') {
        return {
          message: CONVERSATION_SCRIPTS.transitionToQuestionnaire,
          newState: { ...this.state },
          shouldPersistArchetype: true,
          shouldTransitionToNextStep: true
        };
      } else {
        return {
          message: CONVERSATION_SCRIPTS.transitionToComplete,
          newState: { ...this.state },
          shouldPersistArchetype: true,
          shouldTransitionToNextStep: false
        };
      }
    }

    // Check for rejection or desire to change
    if (input.includes('no') || input.includes('different') || input.includes('change') || 
        input.includes('wrong') || input.includes('not right')) {
      
      this.state.phase = 'archetype-selection';
      this.state.selectedArchetype = null;
      this.state.attempts = 0;
      
      return {
        message: 'No problem! Let\'s find the right archetype for you.\n\n' + CONVERSATION_SCRIPTS.archetypePresentation,
        newState: { ...this.state }
      };
    }

    // If unclear, ask for clarification
    return {
      message: 'I want to make sure I understand - are you confirming that you want to be a ' + 
               (this.state.selectedArchetype || 'this archetype') + '? Please say "yes" to confirm or "no" to choose a different one.',
      newState: { ...this.state }
    };
  }

  // Handle completion phase
  private handleComplete(): ConversationResponse {
    return {
      message: 'Your archetype selection is complete! Feel free to ask me any fantasy football questions.',
      newState: { ...this.state }
    };
  }

  // Handle error cases
  private handleError(): ConversationResponse {
    return {
      message: CONVERSATION_SCRIPTS.errorMessage,
      newState: { ...this.state },
      isError: true
    };
  }

  // Reset conversation state
  reset(): void {
    this.state = {
      phase: 'greeting',
      selectedArchetype: null,
      lastUserInput: '',
      attempts: 0
    };
  }

  // Check if conversation is complete
  isComplete(): boolean {
    return this.state.phase === 'complete';
  }

  // Check if archetype has been selected and confirmed
  hasSelectedArchetype(): boolean {
    return this.state.selectedArchetype !== null && this.state.phase === 'complete';
  }
}
