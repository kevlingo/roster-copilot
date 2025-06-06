## Component Breakdown & Implementation Details

### Component Naming & Organization

  * **React Component Names:** `PascalCase` (e.g., `UserProfileCard`).
  * **File Names for Components:** `PascalCase.tsx` (e.g., `UserProfileCard.tsx`).
  * **Organization:** Shared components in `components/` subdirectories (core, layout, ai-copilot, feature-specific). Very specific, non-reusable components might be co-located if simple, but preference for organized `components/` structure for PoC.

### Template for Component Specification

{This template MUST be used to specify any new, significant UI component developed for Roster Copilot. It ensures comprehensive definition and clear guidance for implementation.}

**#### Component: {ComponentName}**

  * **Purpose:** {Briefly describe what this component does, its primary responsibility, and its role within the user interface. This MUST be clear and concise.}
  * **Source File(s):** {Specify the exact file path(s). MUST adhere to naming conventions.}
  * **Visual Reference:** {Link to Figma frame/component or sketch. REQUIRED if visual representation exists/needed.}
  * **Props (Properties):**
    | Prop Name     | Type                                                     | Required? | Default Value | Description                                                                                               |
    | :------------ | :------------------------------------------------------- | :-------- | :------------ | :-------------------------------------------------------------------------------------------------------- |
    | `{propName1}` | `{e.g., string, number, boolean, UserProfile, () => void}` | {Yes/No}  | {If any}    | {MUST clearly state the prop's purpose, any constraints, and usage.} |
  * **Internal State (if any):**
    | State Variable   | Type      | Initial Value | Description                                                                                       |
    | :--------------- | :-------- | :------------ | :------------------------------------------------------------------------------------------------ |
    | `{stateVar1}`    | `{type}`  | `{value}`     | {Description of the state variable, its purpose, and when/how it changes.}                      |
  * **Key UI Elements / Structure:**
    {Pseudo-HTML/JSX or clear textual description of DOM and key visual elements. Include conditional rendering notes.}
  * **Events Handled / Emitted:**
      * **Handles:** {Significant user interaction events handled directly.}
      * **Emits:** {Custom events or callbacks emitted to parent (function props with signatures).}
  * **Actions Triggered (Side Effects):**
      * **State Management (Context/Zustand):** {If component dispatches actions or selects from shared state.}
      * **API Calls:** {Specify API endpoints called, conditions, and response handling.}
  * **Styling Notes:**
      * {MUST reference specific DaisyUI components used. MUST specify key Tailwind CSS utilities or `@apply` directives for custom classes. Dynamic styling logic MUST be described.}
  * **Accessibility (AX) Notes:**
      * {MUST list specific ARIA attributes/values. MUST describe required keyboard navigation behavior. MUST note focus management requirements.}

### Foundational/Shared Components (PoC Approach)

*For the Roster Copilot Proof-of-Concept, detailed specifications for most individual UI components will be created emergently during the UI design and development phases, adhering strictly to the "Template for Component Specification" defined above. Focus will be on components critical for the MVP user flows.*
*Any foundational or globally shared custom components identified (e.g., a specialized `AIPanelViewCard.tsx` or a core `PageLayout.tsx`) must be documented using the template to ensure clarity and reusability.*

### Conversational Onboarding Architecture

The conversational onboarding system represents a significant architectural pattern that transforms traditional form-based user onboarding into natural chat-based interactions. This section defines the key architectural patterns and implementation approaches.

#### **Core Architecture Principles**

* **Chat-First Design:** All onboarding interactions occur through the existing `PersistentChatInterface.tsx` component
* **Conversation State Management:** Dedicated state management for tracking onboarding progress, user selections, and conversation context
* **Natural Language Processing:** Client-side processing for interpreting user responses in natural language format
* **Progressive Enhancement:** Modular design allowing for express mode, voice-ready architecture, and cross-device continuity

#### **Key Components & Patterns**

**1. Conversation State Management**
```typescript
interface OnboardingConversationState {
  currentPhase: 'greeting' | 'mode-selection' | 'archetype-selection' | 'questionnaire' | 'complete'
  selectedMode: 'express' | 'full' | null
  selectedArchetype: string | null
  questionnaireAnswers: Record<string, string>
  conversationHistory: ConversationMessage[]
}
```

**2. Response Processing Pattern**
```typescript
interface ResponseProcessor {
  processArchetypeSelection(userInput: string): ArchetypeSelectionResult
  processQuestionnaireResponse(userInput: string, questionType: string): QuestionnaireResult
  handleUnclearResponse(userInput: string, context: ConversationContext): ClarificationResponse
}
```

**3. Conversation Flow Control**
* **Mode Selection:** Express vs. Full conversation mode routing
* **Archetype Selection:** Natural language processing for archetype identification
* **Questionnaire Flow:** Sequential question handling with confirmation patterns
* **Error Recovery:** Graceful handling of unclear responses and technical failures

#### **Integration Points**

* **Chat Interface:** Extends `PersistentChatInterface.tsx` with onboarding-specific message handling
* **API Integration:** Connects to existing `PUT /api/users/me` endpoint for profile updates
* **State Persistence:** Integrates with chat history persistence system for cross-device continuity
* **Navigation:** Seamless transition to main application upon completion

### Chat History Persistence Patterns

The chat history persistence system provides the foundation for cross-device conversation continuity, AI personalization, and robust user experience. This section defines the architectural patterns for comprehensive chat storage and retrieval.

#### **Core Architecture Principles**

* **Comprehensive Persistence:** All chat conversations stored in backend, including onboarding interactions
* **UI vs. Backend Separation:** UI "clear" functionality only affects visible history, backend storage remains intact
* **Cross-Device Continuity:** Conversation state preserved and synchronized across device switches
* **Performance Optimization:** Efficient loading and caching strategies for large conversation histories

#### **Key Components & Patterns**

**1. Chat History Data Model**
```typescript
interface ChatMessage {
  id: string
  userId: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  conversationContext?: OnboardingContext | GeneralChatContext
}

interface ConversationSession {
  id: string
  userId: string
  startTime: Date
  lastActivity: Date
  messageCount: number
  conversationType: 'onboarding' | 'general' | 'digest'
}
```

**2. Persistence Service Pattern**
```typescript
interface ChatHistoryService {
  persistMessage(message: ChatMessage): Promise<void>
  loadConversationHistory(userId: string, limit?: number): Promise<ChatMessage[]>
  clearUIHistory(): void // UI-only operation
  syncConversationState(deviceId: string): Promise<ConversationState>
}
```

**3. State Management Integration**
* **Local State:** Visible chat messages managed in component state
* **Backend Sync:** Automatic persistence of all messages on send/receive
* **Cross-Device Sync:** Conversation state synchronization on device handoff
* **Offline Handling:** Queue messages for sync when connection restored

#### **Performance Considerations**

* **Lazy Loading:** Implement pagination for large conversation histories
* **Caching Strategy:** Cache recent conversations in memory with efficient retrieval
* **Database Optimization:** Indexed queries for user-specific chat history retrieval
* **Real-time Sync:** Efficient synchronization patterns for cross-device continuity

#### **Integration Points**

* **Chat Interface:** Seamless integration with `PersistentChatInterface.tsx` for automatic persistence
* **API Layer:** Dedicated chat history endpoints for CRUD operations
* **Authentication:** User-scoped chat history with proper access controls
* **Analytics:** Foundation for conversation analytics and AI personalization learning