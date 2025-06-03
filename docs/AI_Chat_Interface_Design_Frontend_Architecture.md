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
    6.  User can click the 'X' icon on the overlay to hide the chat bubbles. The textbox might remain or also be minimized/hidden (TBD based on further refinement, default: bubbles hide, textbox remains).
    7.  User can click a settings cog icon to access options like 'Clear History'.

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
|                    | AI: Latest response    | [X]cog| (Light Blue Bubble)
|                    +------------------------+       |
|                                (Scrollbar if needed) |
|                                                     |
|                                                     |
| Page Content (Visible, interactive)                 |
+-----------------------------------------------------+
| [ Chat Input Textbox (Neutral Color)        ] [Send]| Fixed Bottom
+-----------------------------------------------------+
```

*   **Key Elements:**
    *   **Page Content:** Background, fully interactive.
    *   **Chat Bubbles Overlay:** Positioned typically on one side (e.g., bottom-right or bottom-left corner, above the textbox area), showing 3-4 messages.
    *   **'X' Icon:** Clearly visible on the chat bubble overlay area, likely top-right of the overlay.
    *   **Settings Cog Icon:** Adjacent to the 'X' or within the overlay area, for 'Clear History'.
    *   **Chat Input Textbox:** Fixed at the screen bottom, spanning a comfortable width.
    *   **Send Button/Icon:** Adjacent to the textbox.

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
*   **Interaction:**
    *   Always focused or easily focusable.
    *   Handles text input.
    *   Submission via "Enter" key (configurable: Enter to send, Shift+Enter for new line) and/or a "Send" icon button.
*   **States:**
    *   Default
    *   Focused
    *   Typing (optional: subtle animation or indicator)
    *   Disabled (if AI is processing and cannot accept new input temporarily - rare).

#### 2.4.2. Chat History Bubbles Overlay (`ChatBubbleOverlay`)

*   **Appearance:**
    *   Overlays a portion of the page (e.g., bottom-right or bottom-left quadrant).
    *   Displays the latest 3-4 messages. Older messages are accessible via scroll within this overlay.
    *   Transparent or semi-transparent background for the overlay container *itself* is not recommended as it can make bubbles harder to read. Bubbles themselves are opaque. The *area* taken by bubbles should allow underlying content to be seen around it.
*   **Bubbles (`ChatMessageBubble`):**
    *   **User Bubble:** Light grey background, text aligned left (or right, depending on standard chat conventions adopted). Rounded corners.
    *   **AI Bubble:** Light blue background, text aligned right (or left). Rounded corners.
    *   **Content:** Message text. Timestamps optional, subtle.
    *   **Spacing:** Adequate padding within bubbles, and margin between bubbles.
*   **Interaction:**
    *   Vertical scrolling within the overlay if content exceeds visible height.
    *   Text selection within bubbles should be possible.
    *   Links within chat messages should be clickable.
*   **States:**
    *   Visible
    *   Hidden (triggered by 'X' control)
    *   Scrolling

#### 2.4.3. Hide Control ('X' Icon) (`HideChatButton`)

*   **Appearance:**
    *   Standard 'X' (close) icon.
    *   Positioned on the `ChatBubbleOverlay` (e.g., top-right corner of the overlay area).
    *   Sufficiently large for easy tapping/clicking.
    *   Contrasting color for visibility.
*   **Interaction:**
    *   On click/tap: Hides the `ChatBubbleOverlay`. The `ChatInput` may remain or also hide/minimize. If `ChatInput` also hides, a "Show Chat" affordance must appear.
*   **States:**
    *   Default
    *   Hover/Focus

#### 2.4.4. Settings Cog & Clear History (`ChatSettings`)

*   **Appearance:**
    *   Standard settings (cog) icon.
    *   Positioned near the 'X' icon or within the `ChatInput` area for less frequent access.
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
    *   Close/Hide (X)
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
    *   Renders the textbox and send button.
    *   Receives current input value and `onChange`/`onSubmit` handlers from `PersistentChatInterface`.
    *   Located in `src/components/ai-chat/ChatInput.tsx`.
*   **`ChatBubbleOverlay` (Presentational Component):**
    *   Renders the list of chat messages and controls (Hide, Settings).
    *   Receives messages array, visibility status, and control handlers from `PersistentChatInterface`.
    *   Manages internal scrolling.
    *   Located in `src/components/ai-chat/ChatBubbleOverlay.tsx`.
*   **`ChatMessageBubble` (Presentational Component):**
    *   Renders a single chat message (user or AI).
    *   Receives message content, sender type, timestamp.
    *   Styled differently based on sender.
    *   Located in `src/components/ai-chat/ChatMessageBubble.tsx`.
*   **`HideChatButton` (Presentational Component):**
    *   Renders the 'X' icon.
    *   Receives `onClick` handler.
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

### 3.7. Future Considerations

*   **Message Streaming:** For more interactive AI responses, consider streaming tokens instead of waiting for the full reply.
*   **Markdown/Rich Text Support:** Allow AI to send formatted messages.
*   **File Uploads:** If users need to send files to the AI.
*   **User Authentication:** If chat history needs to be tied to specific users.
*   **Internationalization (i18n):** For UI text.

## 4. Conclusion

This specification provides a foundational UI/UX design and frontend architecture for the AI chat interface. It aims for a user-centric, friendly, and technically sound implementation that integrates well with the existing project structure. Iteration and user feedback will be crucial for refining the experience.