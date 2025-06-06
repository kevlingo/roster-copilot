## Architectural / Design Patterns Adopted

1.  **Integrated Full-Stack Application (via Next.js):** Utilizing Next.js to handle both frontend (React components) and backend (API routes) within a single, cohesive project structure. *Rationale:* Simplifies development, deployment (Netlify), and tooling for the PoC; leverages user familiarity.
2.  **Provider Model / Repository Pattern (for Data Access):** Abstracting data access logic for SQLite (both User Profile and Static NFL Data for PoC). *Rationale:* Supports NFR for Maintainability/Extensibility, making future swaps to live databases/APIs much simpler with minimal changes to core application logic.
3.  **AI-Powered Conversational Intelligence (for Google Gemini AI):** All interactions with Google Gemini AI are encapsulated and managed through dedicated backend services with Jake personality system and conversation intelligence. *Rationale:* Centralizes AI interaction logic, manages API key security, enables dynamic personality-driven conversations, and provides context-aware response generation.
4.  **Component-Based Architecture (for Frontend - via React/Next.js):** The UI will be built as a collection of reusable React components, styled with Tailwind CSS and DaisyUI. *Rationale:* Standard for modern web development with React; promotes UI reusability, maintainability, testability, and aligns with chosen UI libraries.
5.  **Serverless Functions (for API Backend - via Netlify/Next.js):** Next.js API routes will be deployed as serverless functions on Netlify. *Rationale:* Scalable, cost-effective for PoC, simplifies backend infrastructure management; Next.js handles the abstraction.
6.  **External Email Service Integration (Resend):** Transactional emails (e.g., verification, password reset) are handled via Resend. *Rationale:* Reliable email delivery without managing email server infrastructure; common practice for web applications.

## Component View

The Roster Copilot PoC comprises the following key logical components:

1.  **Frontend UI (Next.js/React)**
    * **Description & Responsibilities:** Renders the user interface (UI/UX Specification), handles user input, manages client-side state (React Context/hooks or Zustand), communicates with the Backend API, displays information including AI Copilot insights, and implements the persistent "AI Copilot Panel/Icon." Built with React, Tailwind CSS, and DaisyUI.
    * **Key Interactions:** User (direct interaction), Backend API (HTTP requests/responses), Client-Side State Management.

2.  **Backend API (Next.js API Routes)**
    * **Description & Responsibilities:** Exposes HTTP endpoints for the Frontend UI, handles requests, orchestrates calls to the "AI Copilot Service," "Data Access Layer (DAL)," and "Notification Service (for email)," manages basic user sessions, formats responses. Deployed as serverless functions on Netlify.
    * **Key Interactions:** Frontend UI (receives requests, sends responses), AI Copilot Service (invokes for AI logic), Data Access Layer (DAL) (for data operations), Notification Service (for sending emails).

3.  **AI Copilot Service (Backend Logic within Next.js) - Enhanced with Conversational Intelligence**
    * **Description & Responsibilities:** Central "brain" for AI features with advanced conversational intelligence. Processes requests for AI insights, manages Jake personality system and conversation context, implements dynamic conversation flow with personality adaptation, constructs intelligent prompts for Gemini AI Service, processes responses with conversation memory and building, manages archetype discovery through natural conversation, and supports adaptive questionnaire flow.
    * **Key Interactions:** Backend API (receives requests, returns conversational responses), Data Access Layer (DAL) (for User Profile & Conversation History), Google Gemini AI Service (External) (sends context-aware prompts, receives personality-driven responses).

4.  **Data Access Layer (DAL) (Backend Logic within Next.js - Revised)**
    * **Description & Responsibilities:** Implements the "Provider Model / Repository Pattern" abstracting SQLite-specific logic. Provides a stable interface for CRUD operations on User Profile & Preferences data and for reading/querying Static NFL Data (both stored in the PoC SQLite database). Internally executes direct SQL queries via a lightweight Node.js SQLite library. Manages SQLite connection and initial data seeding for PoC.
    * **Key Interactions:** AI Copilot Service & Backend API (primary consumers, via abstract interface functions), SQLite Database (executes SQL queries).

5.  **Notification Service (Backend Logic within Next.js - for Email)**
    * **Description & Responsibilities:** Handles sending transactional emails (e.g., account verification, password reset) via the Resend API. Encapsulates email formatting and interaction with Resend.
    * **Key Interactions:** Backend API (receives requests to send emails), Resend API (External) (sends email delivery requests).

6.  **Google Gemini AI Service (External)**
    * **Description & Responsibilities:** External third-party service by Google. Receives prompts from Roster Copilot's "AI Copilot Service" (via Google AI SDK) and returns generative AI responses for advice, explanations, and insights. Appropriate Gemini models (e.g., Flash, Pro) will be selected for PoC needs.
    * **Key Interactions:** AI Copilot Service (sends prompts, receives responses), Internet (for backend to reach Google APIs).

7.  **Resend API (External)**
    * **Description & Responsibilities:** External third-party service for sending transactional emails. Receives requests from Roster Copilot's "Notification Service."
    * **Key Interactions:** Notification Service (sends email requests).

**Component Interaction Diagram (PoC):**
```mermaid
graph TD
    U[User] -->|Interacts via Browser| FE["Frontend UI\n(Next.js/React, Tailwind/DaisyUI)"]

    subgraph "Roster Copilot PoC (Next.js Application on Netlify)"
        FE --- API["Backend API\n(Next.js API Routes)"]
        API --- AIM["AI Copilot Service\n(Backend Logic)"]
        API --- NS["Notification Service\n(Email via Resend)"]
        AIM --- DAL["Data Access Layer (DAL)\n(Provider Pattern)"]
        DAL --- DB["PoC Database\n(SQLite: User Profiles + Static NFL Data)"]
        
        %% Defining interactions clearly
        FE  -->|HTTP Requests| API
        API -->|Service Calls| AIM
        API -->|Email Requests| NS
        AIM -->|Data Requests/Updates| DAL
        %% Note: Some simple API routes might interact with DAL directly if no AI logic is needed,
        %% but primary AI-driven data flows through AI Copilot Service. And auth flows might call NS.
    end

    AIM -->|API Calls via SDK| ExtAI["Google Gemini AI Service\n(External API)"]
    NS -->|API Calls| ExtEmail["Resend API\n(External API for Email)"]
    
    %% Styling for clarity with more subdued colors and black text
    style U fill:#ddeeff,stroke:#333,stroke-width:2px,color:#000
    style ExtAI fill:#e6e6e6,stroke:#333,stroke-width:2px,color:#000
    style ExtEmail fill:#e6e6e6,stroke:#333,stroke-width:2px,color:#000
    style DB fill:#fff5cc,stroke:#333,stroke-width:2px,color:#000