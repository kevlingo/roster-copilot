# AI Chat Interface: UI/UX Design & Frontend Architecture

**Version:** 1.0
**Date:** 2025-06-03
**Author:** Design Architect Bot

## 1. Introduction

This document outlines the UI/UX design specifications and frontend architecture for a new AI chat interface. The primary goal is to improve user engagement by providing a persistent, intuitive, and "friendly and approachable" chat experience that overlays existing page content without disrupting user interaction with the underlying page.

## 2. UI/UX Design Specification

### 2.1. Overall Concept & User Flow

*   **Persistent Presence:** The chat interface is always available. The input textbox remains fixed at the bottom of the screen.
*   **Overlay Bubbles:** Chat history (latest 3-4 messages) appears as bubbles overlaying the current page content. Users can still interact with elements behind the semi-transparent or strategically placed bubbles.
*   **User Interaction Flow:**
    1.  User types a message into the persistent textbox at the bottom of the screen and submits (e.g., presses Enter or a send icon).
    2.  The user's message appears as a new light grey chat bubble in the overlay.
    3.  The AI processes the message.
    4.  The AI's response appears as a new light blue chat bubble in the overlay.
    5.  The chat history scrolls within its designated overlay area if messages exceed the visible limit (3-4 bubbles).
    6.  User can click the 'X' (Hide Chat) icon, now located within the `ChatInput` component area, to hide the chat bubbles. The textbox itself (along with these controls) will remain visible.
    7.  User can click a settings (cog) icon, also located within the `ChatInput` component area, to access options like 'Clear History'.

### 2.2. Wireframes (Descriptive)

**Scenario 1: Chat Active - Overlay Visible**

```
+-----------------------------------------------------+
| Page Content (Visible, interactive)                 |
|                                                     |
|   +------------------------+                        |
|   | User: Previous msg 2   | (Light Grey Bubble)    |
|   +------------------------+                        |
|                    +------------------------+       |
|                    | AI: Previous msg 1     |       | (Light Blue Bubble)
|                    +------------------------+       |
|   +------------------------+                        |
|   | User: Latest message   | (Light Grey Bubble)    |
|   +------------------------+                        |
|                    +------------------------+       |
|                    | AI: Latest response    |       | (Light Blue Bubble)
|                    +------------------------+       |
|                                (Scrollbar if needed) |
|                                                     |
|                                                     |
| Page Content (Visible, interactive)                 |
+-----------------------------------------------------+
| [ Chat Input Textbox (Neutral Color) ] [Send][X][cog]| Fixed Bottom
+-----------------------------------------------------+
```

*   **Key Elements:**
    *   **Page Content:** Background, fully interactive.
    *   **Chat Bubbles Overlay:** Positioned typically on one side (e.g., bottom-right or bottom-left corner, above the textbox area), showing 3-4 messages.
    *   **Chat Input Textbox:** Fixed at the screen bottom, spanning a comfortable width.
    *   **Send Button/Icon:** Adjacent to the textbox.
    *   **Hide Chat ('X') Icon:** Located within the `ChatInput` area, to the right of the Send button.
    *   **Settings Cog Icon:** Located within the `ChatInput` area, to the right of the Hide Chat button.

**Scenario 2: Chat Hidden**

```
+-----------------------------------------------------+
| Page Content (Visible, interactive)                 |
|                                                     |
|                                                     |
|                                                     |
|                                                     |
|                                                     |
|                                                     |
|                                                     |
|                                                     |
| Page Content (Visible, interactive)                 |
+-----------------------------------------------------+
| [ Chat Input Textbox (Neutral Color)        ] [Send]| Fixed Bottom (Option to show a small "show chat" icon if textbox also hides)
+-----------------------------------------------------+
```
*(Alternatively, if textbox also hides, a small launcher icon, e.g., a chat bubble icon, would be visible at the bottom to re-open the chat interface).*

### 2.3. Visual Design Language ("Friendly and Approachable")

*   **Color Palette:**
    *   **AI Bubbles:** Light Blue (e.g., `#A0D2DB` or Tailwind's `bg-blue-200`)
    *   **User Bubbles:** Light Grey (e.g., `#E5E7EB` or Tailwind's `bg-gray-200`)
    *   **Textbox Background:** Neutral, inviting (e.g., `#F3F4F6` or Tailwind's `bg-gray-100`)
    *   **Text Color:** Dark grey or black for readability (e.g., `#1F2937` or Tailwind's `text-gray-800`)
    *   **Icons:** Medium grey (e.g., `#6B7280` or Tailwind's `text-gray-500`)
*   **Bubble Styling:**
    *   **Corners:** Rounded (e.g., `rounded-lg` or `rounded-xl` in Tailwind).
    *   **Shadows:** Minimal, soft shadow for depth but maintaining a clean look (e.g., `shadow-sm` or a very subtle custom shadow).
*   **Overall Feel:** Clean, light, modern, and uncluttered. Spacing should be generous enough to avoid a cramped feeling.

### 2.4. Component Specifications

#### 2.4.1. Persistent Chat Textbox (`ChatInput`)

*   **Appearance:**
    *   Fixed at the bottom of the viewport.
    *   Width: Typically 60-80% of viewport width, centered, or aligned to one side if chat bubbles are on the other. Max-width for very large screens.
    *   Height: Standard input field height, potentially multi-line capable (expands slightly if user types more text).
    *   Background: Neutral, inviting color (e.g., light grey).
    *   Border: Subtle border or slightly darker background to differentiate from page.
    *   Placeholder Text: e.g., "Type your message..."
    *   Includes 'Send', 'Hide Chat' (X), and 'Chat Settings' (cog) icon buttons, arranged to the right of the text input area.
    *   **Icon Styling:** Icons should be clear, visually harmonious (e.g., similar size and stroke weight, using established icon color like Medium grey `#6B7280`).
    *   **Icon Spacing:** A small, consistent margin (e.g., 4-8px, Tailwind `space-x-1` or `space-x-2`) should be maintained between the text input and the first icon (Send), and between each subsequent icon.
    *   **Icon Order:** Send, Hide Chat, Chat Settings (from left to right, after the text input).
*   **Interaction:**
    *   Always focused or easily focusable.
    *   Handles text input.
    *   Submission via "Enter" key (configurable: Enter to send, Shift+Enter for new line) and/or a "Send" icon button.
    *   **Focus After Send:** After a user successfully sends a message, focus should automatically return to the text input area. This is a standard UX pattern that allows for rapid follow-up messages.
    *   'Hide Chat' (X) button: Hides the `ChatBubbleOverlay`.
    *   'Chat Settings' (cog) button: Opens a popover for settings like "Clear History".
*   **Responsiveness:**
    *   On narrower screens, the text input area will shrink proportionally to accommodate the fixed width of the icon buttons.
    *   Icon buttons must maintain adequate tap target sizes (e.g., minimum 24x24px interactive area, even if the visual icon is smaller) for usability on touch devices. Tailwind classes like `p-2` on the button can help achieve this.
    *   The overall height of the `ChatInput` component should remain consistent.
*   **States:**
    *   Default
    *   Focused
    *   Typing (optional: subtle animation or indicator)
    *   Disabled (if AI is processing and cannot accept new input temporarily - rare).

#### 2.4.2. Chat History Bubbles Overlay (`ChatBubbleOverlay`)

*   **Appearance:**
    *   **Positioning:** Overlays a portion of the page (e.g., typically fixed to the right side of the viewport).
    *   **Height:** The overlay's height should be `calc(100vh - var(--header-height))`.
        *   **Guidance:** This will make the overlay extend from below the header to the bottom of the viewport. A CSS variable (e.g., `--header-height`) representing the application header's height must be defined and accessible. The Tailwind CSS class would be `h-[calc(100vh-var(--header-height))]`.
        *   **Note on `ChatInput`:** Since the `ChatInput` component is fixed at the bottom, the `ChatBubbleOverlay` will visually extend behind it. To ensure all chat messages are viewable and not obscured by the `ChatInput`, the scrollable content area within `ChatBubbleOverlay` should have a `padding-bottom` equal to the height of the `ChatInput` component.
    *   **Width:** The width should be `w-96` (which is `24rem` or `384px`).
        *   **Tailwind CSS:** Use `w-96`.
    *   **Content Display:** Displays the latest messages. Older messages are accessible via scroll within this overlay.
    *   **Background & Transparency:** The overlay container itself should generally not have a background that obscures page content unnecessarily, especially if it's just a positioning wrapper. Chat bubbles themselves are opaque. The design goal is that underlying page content remains visible around the chat interface elements.
*   **Bubbles (`ChatMessageBubble`):**
    *   **User Bubble:** Light grey background. Aligns to the **right** side of the chat overlay. Rounded corners. (Content within the bubble itself typically remains left-aligned for readability).
    *   **AI Bubble:** Light blue background. Aligns to the **left** side of the chat overlay. Rounded corners. (Content within the bubble itself typically remains left-aligned for readability).
    *   **Content:** Message text. Timestamps optional, subtle.
    *   **Sizing:** Bubbles should have a defined `max-width` (e.g., `max-w-2xl` or `max-w-xl` using Tailwind CSS) to prevent them from stretching too wide within the `48rem` overlay. This ensures better readability.
    *   **Spacing & Alignment:**
        *   **Vertical Spacing:** To control the vertical gap between consecutive messages, each `ChatMessageBubble` should have a bottom margin. Given `flex-direction: column-reverse` in `ChatBubbleOverlay`, Tailwind's `mb-2` (0.5rem) is a good starting point. This creates a small, consistent space above each new message, improving the visual flow. The value (`mb-1`, `mb-2`, `mb-3`) can be adjusted based on visual testing.
        *   **Horizontal Alignment:** To clearly distinguish sender, the standard alignment for messages within the chat overlay is:
            *   AI-sent messages: Align to the **left**.
            *   User-sent messages: Align to the **right**.
            *   This styling is applied directly to the root element of the `ChatMessageBubble` component.
        *   **Tailwind CSS Implementation:** Assuming the parent container of bubbles in `ChatBubbleOverlay` is a flex column (e.g., using `flex flex-col` or `flex flex-col-reverse` for stacking messages), the following classes are conditionally applied to `ChatMessageBubble`:
            *   AI Messages: `self-start` (aligns the bubble to the **left** start of the flex container).
            *   User Messages: `self-end` (aligns the bubble to the **right** end of the flex container).
        *   This visual differentiation is crucial for readability. Text *within* each bubble typically remains left-aligned for optimal readability, regardless of the bubble's placement.
*   **Interaction:**
    *   Vertical scrolling within the overlay if content exceeds visible height. New messages appear at the bottom, and the view automatically scrolls to show the latest messages. This "scroll from bottom" behavior remains a core requirement and is fully compatible with the updated left/right alignment of messages.
    *   Text selection within bubbles should be possible.
    *   Links within chat messages should be clickable.
*   **States:**
    *   Visible
    *   Hidden (triggered by 'X' control)
    *   Scrolling

#### 2.4.3. Toggle Chat Visibility Control (`HideChatButton`)

*   **Purpose:** Allows the user to show or hide the `ChatBubbleOverlay`.
*   **Appearance (Dynamic based on `isChatVisible` state):**
    *   **When chat is visible (`isChatVisible={true}`):**
        *   Displays an `EyeOff` icon (from `lucide-react`) to indicate the action of hiding the chat.
    *   **When chat is hidden (`isChatVisible={false}`):**
        *   Displays an `Eye` icon (from `lucide-react`) to indicate the action of showing the chat.
    *   Positioned within the `ChatInput` component, to the right of the 'Send' button.
    *   Icon should be visually consistent with the 'Send' and 'Settings' icons in terms of size and stroke weight.
    *   Sufficiently large interactive area for easy tapping/clicking (e.g., by applying padding like `p-2` to the button).
    *   Contrasting color for visibility against the `ChatInput` background.
*   **Interaction:**
    *   On click/tap: Toggles the visibility of the `ChatBubbleOverlay`. The `ChatInput` (containing this button) remains visible.
*   **Tooltip / `aria-label` (Dynamic based on `isChatVisible` state):**
    *   **When chat is visible (`isChatVisible={true}`):**
        *   Tooltip: "Hide chat history"
        *   `aria-label`: "Hide chat history"
    *   **When chat is hidden (`isChatVisible={false}`):**
        *   Tooltip: "Show chat history"
        *   `aria-label`: "Show chat history"
*   **Accessibility:**
    *   `aria-pressed`: Set to `"true"` when the chat overlay is visible (button is "pressed" to show), and `"false"` when hidden. This clearly communicates the toggle state.
*   **States (for the button itself):**
    *   Default
    *   Hover/Focus

#### 2.4.4. Settings Cog & Clear History (`ChatSettings`)

*   **Appearance:**
    *   Standard settings (cog) icon.
    *   Positioned within the `ChatInput` component, to the right of the 'Hide Chat' (X) button.
    *   Icon should be visually consistent with the 'Send' and 'Hide Chat' icons.
    *   Sufficiently large interactive area for easy tapping/clicking.
*   **Interaction:**
    *   On click/tap: Opens a small dropdown/popover.
    *   Popover contains:
        *   "Clear Chat History" button/link.
        *   (Optional: other settings like "Disable AI sounds", etc.)
    *   "Clear Chat History":
        *   Prompts for confirmation (e.g., "Are you sure you want to clear the chat history? This cannot be undone.").
        *   On confirmation, clears all messages from the `ChatBubbleOverlay` and associated state.
*   **States (Cog Icon):**
    *   Default
    *   Hover/Focus
    *   Active (popover open)

### 2.5. Iconography

*   **Style:** Clean, modern, and universally understandable. Material Icons, Heroicons, or Feather Icons are good sources.
*   **Icons Needed:**
    *   Send (e.g., paper plane)
    *   Toggle Chat Visibility (e.g., `Eye` / `EyeOff` from `lucide-react`)
    *   Settings (cog)
    *   Scroll indicators (if custom, otherwise browser default)
    *   (Optional) Launcher icon if entire chat hides (e.g., chat bubble icon)

### 2.6. Typography

*   **Font Family:** A softer, easy-to-read sans-serif font. Examples:
    *   `Inter`
    *   `Roboto`
    *   `Nunito Sans`
    *   System fonts (for performance and native feel)
    *   The project's existing font, if suitable.
*   **Sizing:**
    *   Chat message text: Legible size, e.g., 14px-16px.
    *   Timestamps/metadata: Smaller, e.g., 10px-12px, less emphasis.
*   **Line Height:** Adequate for readability, e.g., 1.4-1.6.

### 2.7. Accessibility Considerations (WCAG 2.1 AA+)

*   **Keyboard Navigation:** All interactive elements (input, send, hide, settings, clear history, scroll) must be keyboard accessible and operable.
*   **Focus Management:** Clear focus indicators for all interactive elements. When chat opens/closes, focus should be managed logically.
*   **ARIA Attributes:**
    *   Use `aria-live="polite"` or `aria-live="assertive"` for the chat message area so screen readers announce new messages.
    *   Proper roles for chat elements (e.g., `log`, `form`, `button`).
    *   `aria-label` for icon-only buttons.
    *   `aria-pressed` for toggle buttons (like the Toggle Chat Visibility button) to indicate their current state.
*   **Color Contrast:** Ensure sufficient contrast between text and background colors in bubbles, input field, and controls.
*   **Text Resizing:** Interface should remain usable when text is zoomed.
*   **Motion:** Minimize unnecessary animations. If animations are used, provide an option to reduce motion.

## 3. Frontend Architecture Plan

Given the project uses Next.js, React, TypeScript, and Tailwind CSS, the architecture will leverage these.

### 3.1. Core Components (React/TypeScript)

*   **`PersistentChatInterface` (Container Component):**
    *   Manages overall state (visibility, chat history).
    *   Renders `ChatInput` and `ChatBubbleOverlay`.
    *   Handles communication with the AI service.
    *   Located in `src/components/ai-chat/PersistentChatInterface.tsx`.
*   **`ChatInput` (Presentational/Controlled Component):**
    *   Renders the textbox, 'Send' button, 'HideChatButton', and 'ChatSettings' button/icon.
    *   Receives current input value and `onChange`/`onSubmit` handlers from `PersistentChatInterface`.
    *   Receives handlers for hide chat and open settings from `PersistentChatInterface`.
    *   Located in `src/components/ai-chat/ChatInput.tsx`.
*   **`ChatBubbleOverlay` (Presentational Component):**
    *   Renders the list of chat messages, with new messages appearing at the bottom.
    *   Receives messages array, visibility status from `PersistentChatInterface`.
    *   Manages internal scrolling. The scroll view should automatically be positioned at the bottom to show the latest messages.
        *   **Implementation Guidance for Scrolling:**
            *   The container holding the messages (within `ChatBubbleOverlay`) should use `display: flex` and `flex-direction: column-reverse`. This will visually stack messages from bottom to top, with the most recent message at the visual bottom. The underlying HTML order of messages will be oldest to newest.
            *   The scrollable container itself should then be styled with `overflow-y: auto`.
            *   To ensure the scroll view automatically shows the latest messages (which are now at the "top" of the reversed flex container, visually at the bottom), the scrollable container typically has its `scrollTop` effectively at `0` when using `column-reverse` to show the "end" of the content. New items added to the DOM should maintain this scroll position.
            *   If manual scroll adjustment is needed (e.g., on initial load or specific interactions), JavaScript can be used:
                *   Use a `useEffect` hook in React that triggers when the `messages` array changes.
                *   Inside the effect, get a ref to the scrollable messages container.
                *   Set `scrollableContainerRef.current.scrollTop = 0;` (as with `column-reverse`, the visual bottom corresponds to the start of the scrollable content). Test thoroughly, as browser behavior can sometimes vary with flex-reverse and scrolling.
            *   **Content Boundary:** Ensure the scrollable message area is properly constrained within the overlay's dimensions. This includes respecting the overall height calculated (`calc(100vh - var(--header-height))`) and the bottom padding allocated for the `ChatInput` component, thereby preventing messages from being visually obscured by the header or input area.
    *   Located in `src/components/ai-chat/ChatBubbleOverlay.tsx`.
*   **`ChatMessageBubble` (Presentational Component):**
    *   Renders a single chat message (user or AI).
    *   Receives message content, sender type, timestamp.
    *   **Styling and Alignment:**
        *   Styled differently based on sender (e.g., background color as specified in section 2.3 Visual Design Language).
        *   **Alignment within Overlay:** The standard alignment is:
            *   AI-sent messages: Align to the **left** of the chat overlay.
            *   User-sent messages: Align to the **right** of the chat overlay.
            *   **Tailwind CSS for Alignment:** This is achieved by conditionally applying classes to the root element of the `ChatMessageBubble`. Assuming the parent container in `ChatBubbleOverlay` (which uses `flex flex-col-reverse`) is a flex column, use:
                *   `self-start` for AI-sent messages (aligns the bubble to the **left** start).
                *   `self-end` for User-sent messages (aligns the bubble to the **right** end).
            *   Text *within* each bubble typically remains left-aligned for readability.
        *   **Implementation Guidance for Message Width:**
            *   Individual message bubbles should have a `max-width` to prevent them from becoming uncomfortably wide within the `w-96` (`24rem`) `ChatBubbleOverlay`.
            *   A recommended starting value is `max-w-2xl` (Tailwind CSS, equivalent to `42rem` or `672px`). This provides good readability while leaving some visual margin within the overlay. Alternatives like `max-w-xl` (`36rem` or `576px`) could be considered for an even narrower appearance.
            *   The final `max-width` should be determined after visual testing and applied to the root element of the `ChatMessageBubble` component.
    *   Located in `src/components/ai-chat/ChatMessageBubble.tsx`.
*   **`HideChatButton` (Presentational Component):**
    *   Renders a dynamic icon (`Eye` or `EyeOff`) to toggle chat visibility.
    *   Receives `onClick` handler and an `isChatVisible: boolean` prop to determine its state and appearance.
    *   Manages its `aria-label`, `aria-pressed` state, and tooltip dynamically based on `isChatVisible`.
    *   Located in `src/components/ai-chat/buttons/HideChatButton.tsx`.
*   **`ChatSettings` (Presentational Component with local state for popover):**
    *   Renders the cog icon.
    *   Manages its popover visibility.
    *   Contains "Clear History" option, triggering a handler passed from `PersistentChatInterface`.
    *   Located in `src/components/ai-chat/ChatSettings.tsx`.

### 3.2. State Management

*   **Primary State Holder:** `PersistentChatInterface` component.
    *   `chatHistory: Array<MessageObject>` (where `MessageObject` = `{ id: string, text: string, sender: 'user' | 'ai', timestamp: Date }`)
    *   `inputValue: string`
    *   `isOverlayVisible: boolean`
    *   `isLoadingResponse: boolean` (to show loading indicator / disable input)
*   **State Management Library (Optional but Recommended for Scalability):**
    *   Zustand or Jotai are lightweight and work well with Next.js/React.
    *   Context API can be used for simpler cases but might lead to performance issues with frequent updates (like chat messages).
    *   If using a global state manager, the store would hold `chatHistory`, `isOverlayVisible`, etc., and `PersistentChatInterface` would connect to it.
*   **Persistence (Optional):**
    *   Use `localStorage` to persist `chatHistory` and `isOverlayVisible` across sessions (if desired). This should be wrapped in a custom hook or utility to handle SSR/Next.js hydration.

### 3.3. Styling

*   **Tailwind CSS:** Continue using Tailwind CSS for utility-first styling, as it's already in the project.
    *   Define custom colors for chat bubbles in `tailwind.config.js` if specific hex codes are preferred over default palette shades.
    *   Component-specific styles can be co-located or defined using Tailwind's `@apply` for more complex patterns if needed.
*   **Global Styles:** Minimal, in `app/globals.css` for base typography or layout resets if not already handled.

### 3.4. API Integration (Conceptual)

*   **AI Service Endpoint:** An API endpoint will be needed to send user messages and receive AI responses.
*   **Fetching Strategy:**
    *   Use `fetch` API or a lightweight library like `axios`.
    *   Inside `PersistentChatInterface`, an async function `handleSendMessage(message: string)` would:
        1.  Add user message to `chatHistory`.
        2.  Set `isLoadingResponse` to `true`.
        3.  POST message to AI endpoint.
        4.  On response, add AI message to `chatHistory`.
        5.  Set `isLoadingResponse` to `false`.
        6.  Handle errors gracefully (show error message in chat or via toast).
*   **Data Format:** JSON for request and response.
    *   Request: `{ "message": "User's input" }`
    *   Response: `{ "reply": "AI's response" }`

### 3.5. Performance & Optimization

*   **Lazy Loading:** The `PersistentChatInterface` itself might not need lazy loading if it's core UI, but any heavy sub-dependencies should be considered.
*   **Memoization:** Use `React.memo` for presentational components like `ChatMessageBubble` to prevent re-renders if props haven't changed, especially in a long list of messages.
*   **Virtualization (For very long conversations):** If chat history can become extremely long (hundreds/thousands of messages), consider a virtualization library (e.g., `react-window` or `react-virtualized`) for the `ChatBubbleOverlay` to only render visible messages. For 3-4 messages visible at a time with a scroll for slightly more, this is likely overkill initially.
*   **Bundle Size:** Be mindful of any new dependencies added.
*   **Interaction with Underlying Page:**
    *   Ensure the chat overlay (`z-index`) is correctly managed.
    *   The overlay should not capture pointer events outside its visible bounds, allowing interaction with the page underneath. CSS `pointer-events: none;` on the container and `pointer-events: auto;` on the actual chat elements.

### 3.6. Directory Structure (Proposed)

```
src/
├── components/
│   ├── ai-chat/
│   │   ├── PersistentChatInterface.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatBubbleOverlay.tsx
│   │   ├── ChatMessageBubble.tsx
│   │   ├── ChatSettings.tsx
│   │   ├── buttons/
│   │   │   └── HideChatButton.tsx
│   │   └── hooks/  (e.g., useChatHistoryPersistence.ts)
│   ├── ... (other components)
├── ... (other app directories)
├── store/ (if using Zustand/Jotai)
│   └── chatStore.ts
├── types/
│   └── chat.ts (MessageObject interface, etc.)
```

### 3.7. AI Copilot Panel Specifications (Roster Copilot Context)

#### Desktop Panel Behavior
*   **Default State:** Panel defaults to open on desktop for immediate AI assistance access
*   **User Control:** User can collapse/hide panel; state is persisted across sessions using localStorage
*   **Auto-Reopen:** Panel auto-reopens for critical alerts (player injuries, urgent waiver recommendations)
*   **Visual Cues:** Visual indicators (badge, subtle animation) for non-critical new information when collapsed
*   **Persistence:** Panel visibility state maintained across page navigation and browser sessions

#### Mobile Access Pattern
*   **Access Method:** Via clearly labeled AI Copilot icon triggering an overlay interface
*   **Overlay Design:** Bottom half of screen overlay, allowing interaction with top half of underlying page
*   **Touch Interactions:** Optimized for mobile touch patterns with appropriate tap targets
*   **Gesture Support:** Swipe down to dismiss overlay, tap outside to close

#### Contextual Awareness & Verbosity
*   **Screen Context:** Panel content and AI proactivity influenced by user's current screen context
    *   Draft room: Focus on draft recommendations and player analysis
    *   Roster management: Emphasize lineup optimization and player performance
    *   League dashboard: Highlight weekly strategy and upcoming matchups
*   **User Profile Adaptation:** Behavior adapted based on user archetype/profile
    *   "Eager Learner": More detailed explanations and educational content
    *   "Calculated Strategist": Data-focused insights and analytical depth
    *   "Bold Playmaker": Risk/reward analysis and contrarian opportunities
*   **Guidance Level:** Dynamic verbosity based on user experience and preferences

#### Unified Message Center
*   **Chat History:** Panel serves as unified "chat history" style stream for all AI interactions
*   **Content Types:** Messages, alerts, digest summaries, and contextual prompts
*   **Management:** Clear history/dismiss options with confirmation dialogs
*   **Categorization:** Visual distinction between different message types (alerts vs. advice vs. explanations)
*   **Search/Filter:** Ability to search through chat history for specific advice or topics

#### Onboarding Integration
*   **Tour Inclusion:** Onboarding process includes interactive tour of AI Copilot panel functionality
*   **Functionality Demo:** Introduction to panel/icon features, interaction patterns, and customization options
*   **Progressive Disclosure:** Gradual introduction of advanced features as user becomes more comfortable
*   **Help System:** Contextual help and tooltips for panel features and AI capabilities

### 3.8. Future Considerations

*   **Message Streaming:** For more interactive AI responses, consider streaming tokens instead of waiting for the full reply.
*   **Markdown/Rich Text Support:** Allow AI to send formatted messages.
*   **File Uploads:** If users need to send files to the AI.
*   **User Authentication:** If chat history needs to be tied to specific users.
*   **Internationalization (i18n):** For UI text.

## 4. Conclusion

This specification provides a foundational UI/UX design and frontend architecture for the AI chat interface. It aims for a user-centric, friendly, and technically sound implementation that integrates well with the existing project structure. Iteration and user feedback will be crucial for refining the experience.