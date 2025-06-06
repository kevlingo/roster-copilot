## State Management In-Depth (Proof-of-Concept)

The state management strategy for the Roster Copilot PoC prioritizes simplicity, leveraging React's built-in capabilities.

  * **Chosen Solution:**
    1.  **Local Component State (`useState`, `useReducer`):** Default and primary approach.
    2.  **React Context API:** Used sparingly for sharing state across a specific component subtree (e.g., theme state, AI Copilot panel state, read-only User Profile data).
    3.  **Global State (Zustand - if absolutely necessary for PoC):** Only if clearly justified for state needed by many disconnected parts and Context becomes unwieldy. Aim to avoid/minimize for PoC.
  * **Decision Guide for State Location (PoC):** Start local; elevate to Context if shared in a tree; consider global (Zustand) only as a last resort for essential, widespread state.
  * **Store Structure / Slices (PoC - If Zustand is used):** If used, a single, simple store. Complex slicing is out of scope for PoC.
  * **Key Selectors / Actions / Reducers / Thunks (PoC):** State logic managed in components or custom hooks using Context. Complex global store patterns are out of scope.

## AI-Powered Conversation State Management (Enhanced)

With the introduction of Gemini API-powered conversational intelligence, the state management includes specialized patterns for AI conversation handling:

### **1. AI Conversation State Management**
```typescript
interface AIConversationState {
  conversationId: string
  currentPhase: 'onboarding' | 'regular-chat' | 'complete'
  conversationHistory: ConversationMessage[]
  userPersonalityProfile: UserPersonalityProfile
  selectedArchetype: string | null
  questionnaireAnswers: Record<string, string>
  contextSummary?: string // For long conversations
}
```

### **2. Gemini API Integration Pattern**
```typescript
interface GeminiConversationService {
  generateResponse(userInput: string, conversationContext: ConversationContext): Promise<AIResponse>
  buildSystemPrompt(userProfile: UserPersonalityProfile, conversationPhase: string): string
  optimizeContext(conversationHistory: ConversationMessage[]): OptimizedContext
  handleAPIError(error: GeminiAPIError): FallbackResponse
}
```

### **3. AI-Powered Conversation Flow Control**
* **Dynamic Response Generation:** Gemini API powers all conversation responses with Jake's personality
* **Intelligent Archetype Discovery:** Natural conversation analysis for archetype identification
* **Adaptive Questionnaire Flow:** AI-driven question generation based on user responses and style
* **Conversation Intelligence:** Context-aware responses with memory and personality adaptation
* **Error Recovery:** AI-powered conversation repair maintaining Jake's personality