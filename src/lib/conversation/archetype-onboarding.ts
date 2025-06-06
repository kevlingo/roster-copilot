// Archetype Onboarding Conversation Logic
// Story 2.1: Core Conversational Fantasy Manager Archetype Selection

export interface ArchetypeData {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  confirmationMessage: string;
}

export interface ConversationState {
  phase: 'greeting' | 'archetype-presentation' | 'archetype-selection' | 'confirmation' | 'complete';
  selectedArchetype: string | null;
  lastUserInput: string;
  attempts: number;
}

// The four predefined Fantasy Manager Archetypes
export const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'eager-learner',
    name: 'Eager Learner',
    description: 'You love understanding the "why" behind every decision and want to grow your fantasy skills through detailed explanations.',
    detailedDescription: 'As an Eager Learner, you\'re passionate about understanding the strategy behind fantasy football. You want to know not just what to do, but why you should do it. You appreciate detailed explanations, learning opportunities, and insights that help you become a better fantasy manager over time.',
    confirmationMessage: 'Great choice! As an Eager Learner, I\'ll make sure to explain the "why" behind my advice to help you grow your fantasy skills. You\'ll get detailed insights and learning opportunities with every recommendation.'
  },
  {
    id: 'calculated-strategist',
    name: 'Calculated Strategist',
    description: 'You prefer data-driven decisions and want analytical insights to make strategic moves with confidence.',
    detailedDescription: 'As a Calculated Strategist, you thrive on data and analytics. You want statistical insights, trend analysis, and evidence-based recommendations. You prefer to make strategic decisions based on solid data rather than gut feelings or popular opinion.',
    confirmationMessage: 'Excellent! As a Calculated Strategist, I\'ll provide you with data-driven insights, statistical analysis, and evidence-based recommendations to support your strategic decision-making.'
  },
  {
    id: 'bold-playmaker',
    name: 'Bold Playmaker',
    description: 'You enjoy taking calculated risks and making bold moves that can win you championships.',
    detailedDescription: 'As a Bold Playmaker, you\'re not afraid to take calculated risks that others might shy away from. You understand that championships are won by making bold, strategic moves at the right time. You want advice that helps you identify high-upside opportunities and game-changing decisions.',
    confirmationMessage: 'Perfect! As a Bold Playmaker, I\'ll help you identify high-upside opportunities and game-changing moves. I\'ll highlight calculated risks that could give you the edge you need to win your championship.'
  },
  {
    id: 'busy-optimizer',
    name: 'Busy Optimizer',
    description: 'You want efficient, actionable advice that maximizes your team\'s potential without requiring hours of research.',
    detailedDescription: 'As a Busy Optimizer, you have limited time but still want to compete at a high level. You need concise, actionable advice that gets straight to the point. You want efficient recommendations that maximize your team\'s potential without requiring extensive research or time investment.',
    confirmationMessage: 'Smart choice! As a Busy Optimizer, I\'ll provide you with concise, actionable advice that gets straight to the point. You\'ll get efficient recommendations that maximize your team\'s potential without the time-consuming research.'
  }
];

// Conversation scripts and responses
export const CONVERSATION_SCRIPTS = {
  greeting: (userName?: string) => {
    const greeting = userName ? `Hi ${userName}!` : 'Hi!';
    return `${greeting} I'm Jake, your AI Copilot, and I'm excited to help you dominate your fantasy football league! 🏈

To give you the best personalized advice, I'd like to understand your fantasy football style. I'll walk you through four different "Fantasy Manager Archetypes" - think of them as different approaches to playing fantasy football.

Each archetype represents a unique style, and knowing yours will help me tailor my advice perfectly to your preferences. Ready to discover your fantasy football personality?`;
  },

  archetypePresentation: `Great! Let me introduce you to the four Fantasy Manager Archetypes:

**1. Eager Learner** 📚
${ARCHETYPES[0].description}

**2. Calculated Strategist** 📊  
${ARCHETYPES[1].description}

**3. Bold Playmaker** ⚡
${ARCHETYPES[2].description}

**4. Busy Optimizer** ⏰
${ARCHETYPES[3].description}

Which of these sounds most like you? You can tell me the name, number (1-4), or just describe which one resonates with your style!`,

  clarificationRequest: `I want to make sure I understand you correctly! Could you help me out by being a bit more specific? 

You can respond with:
- The archetype name (like "Eager Learner")
- The number (1, 2, 3, or 4)
- Or tell me more about your fantasy football style

Which archetype sounds most like your approach to fantasy football?`,

  invalidSelection: `I didn't quite catch that! Let me help you choose from these four archetypes:

1. **Eager Learner** - Love learning the "why" behind decisions
2. **Calculated Strategist** - Prefer data-driven, analytical insights  
3. **Bold Playmaker** - Enjoy taking calculated risks for big wins
4. **Busy Optimizer** - Want efficient advice without hours of research

Which number (1-4) or name best describes your style?`,

  transitionToQuestionnaire: `Perfect! Since you're an Eager Learner, I have a few quick questions that will help me personalize your experience even further. This will just take a minute and will make my advice much more valuable for your specific learning style.

Ready for the first question?`,

  transitionToComplete: `Awesome! Your archetype has been saved to your profile. You're all set to start getting personalized fantasy football advice tailored to your style.

You can always chat with me here whenever you need help with lineup decisions, waiver wire pickups, trade analysis, or any other fantasy football questions. I'm here to help you dominate your league! 🏆`,

  errorMessage: `I'm having a bit of trouble saving your selection right now. Don't worry though - let me try that again! Your choice is important to me, and I want to make sure it's properly saved.`,

  retryMessage: `Let me try saving your archetype selection again...`
};

// Natural language processing for archetype selection
export function parseArchetypeSelection(userInput: string): string | null {
  const input = userInput.toLowerCase().trim();
  
  // Direct name matches
  if (input.includes('eager learner') || input.includes('eager-learner')) {
    return 'Eager Learner';
  }
  if (input.includes('calculated strategist') || input.includes('calculated-strategist')) {
    return 'Calculated Strategist';
  }
  if (input.includes('bold playmaker') || input.includes('bold-playmaker')) {
    return 'Bold Playmaker';
  }
  if (input.includes('busy optimizer') || input.includes('busy-optimizer')) {
    return 'Busy Optimizer';
  }
  
  // Number matches
  if (input.includes('1') || input.includes('one') || input.includes('first')) {
    return 'Eager Learner';
  }
  if (input.includes('2') || input.includes('two') || input.includes('second')) {
    return 'Calculated Strategist';
  }
  if (input.includes('3') || input.includes('three') || input.includes('third')) {
    return 'Bold Playmaker';
  }
  if (input.includes('4') || input.includes('four') || input.includes('fourth')) {
    return 'Busy Optimizer';
  }
  
  // Keyword-based matching
  if (input.includes('learn') || input.includes('understand') || input.includes('explain') || input.includes('why') || input.includes('detail')) {
    return 'Eager Learner';
  }
  if (input.includes('data') || input.includes('analytic') || input.includes('statistic') || input.includes('strategic') || input.includes('calculated')) {
    return 'Calculated Strategist';
  }
  if (input.includes('bold') || input.includes('risk') || input.includes('aggressive') || input.includes('championship') || input.includes('big move')) {
    return 'Bold Playmaker';
  }
  if (input.includes('busy') || input.includes('quick') || input.includes('efficient') || input.includes('time') || input.includes('optimize')) {
    return 'Busy Optimizer';
  }
  
  return null; // Unable to determine archetype
}

// Get archetype data by name
export function getArchetypeByName(name: string): ArchetypeData | null {
  return ARCHETYPES.find(archetype => archetype.name === name) || null;
}

// Check if user input indicates they want more information
export function isRequestingMoreInfo(userInput: string): boolean {
  const input = userInput.toLowerCase();
  return input.includes('more info') || 
         input.includes('tell me more') || 
         input.includes('explain') || 
         input.includes('details') || 
         input.includes('what does') ||
         input.includes('help me understand');
}

// Generate detailed explanation for a specific archetype
export function getArchetypeDetailedExplanation(archetypeName: string): string {
  const archetype = getArchetypeByName(archetypeName);
  if (!archetype) {
    return "I'd be happy to explain any of the archetypes in more detail! Which one would you like to know more about?";
  }
  
  return `Let me tell you more about the **${archetype.name}**:

${archetype.detailedDescription}

Does this sound like your fantasy football style? If so, just let me know and I'll set this as your archetype!`;
}
