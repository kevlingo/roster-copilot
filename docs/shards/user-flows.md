# User Flows for AI Copilot Features

This document details the specific user flows for AI Copilot interactions, supporting Epic 2-4 development.

## User Flow: New User Onboarding & AI Copilot Setup

* **Goal:** A new user successfully creates their Roster Copilot account and completes the initial AI Copilot onboarding process, establishing their base User Preference Profile, and lands on a starting page ready to engage further with the app.
* **Persona Focus:** "The Eager Learner"
* **Steps:**
    1.  User Arrives: Lands on Roster Copilot application.
    2.  Initiates Sign-Up: Clicks "Sign Up."
    3.  Sign-Up Form: System presents Sign-Up screen; user enters details and submits.
    4.  Account Creation & Login: System validates, creates account, logs user in.
    5.  AI Copilot Introduction & Onboarding Start: System presents welcome and "Fantasy Manager Archetype" selection.
    6.  Archetype Selection: User selects an archetype.
    7.  Conditional: Beginner Questionnaire (If **"Eager Learner"** is selected): System presents 2-3 key questions; user answers.
    8.  Profile Confirmation & "Learn-As-You-Go" Explanation: System confirms profile setup and explains ongoing learning.
    9.  (Optional but Recommended) Brief Interactive Tour: System offers skippable tour of main app areas and AI Copilot panel/icon.
    10. Onboarding Complete: System navigates user to "League Selection / 'My Leagues' Dashboard."

## User Flow: Drafting a Team with AI Co-Pilot Assistance

* **Goal:** The user, guided by the Roster Copilot AI Co-Pilot, successfully participates in a live fantasy football draft and assembles their initial team roster.
* **Persona Focus:** "The Eager Learner"
* **Pre-conditions:** Account created, onboarding complete, joined a league with an active draft.
* **Steps:**
    1.  Enter Draft Room: User navigates to and enters the "Live Draft Room Screen."
    2.  Draft Room Interface Display: Shows draft board, timer, available players, user's roster, AI Co-Pilot panel.
    3.  AI Co-Pilot - Initial Guidance: Provides brief welcome/tip for new users.
    4.  Draft Progresses: Other managers pick; system updates.
    5.  User's Pick Turn: AI Co-Pilot panel displays top recommendation(s) with player context and preference-driven explanation.
    6.  User Reviews AI Advice.
    7.  User Makes a Selection (AI-recommended or independent choice).
    8.  User Confirms Pick.
    9.  Pick Processed & System Updates.
    10. AI Co-Pilot - Post-Pick (Optional): Offers brief feedback/transition.
    11. Repeat steps 4-10 for all user's picks.
    12. Draft Concludes: System indicates draft end.
    13. Post-Draft Summary: User sees final roster; AI Copilot offers brief summary/next steps.

## User Flow: Getting & Acting on In-Season AI Advice

* **Goal:** The user receives, understands, and can easily act upon personalized in-season strategic advice from the Roster Copilot.
* **Persona Focus:** "The Eager Learner"
* **Pre-conditions:** Drafted team, season underway (simulated via PoC static data).

### Scenario A: Interacting with the "Weekly Strategy Digest"
1.  Digest Notification: User sees digest notification on Dashboard or via AI Panel/Icon.
2.  Accessing Full Digest: User clicks link to view full digest.
3.  Viewing Digest Content: System displays "Weekly Strategy Digest Screen" (e.g., with waiver targets, start/sit advice, explanations).
4.  Reviewing Specific Advice: User focuses on a piece of advice.
5.  (Optional) Getting More Detail: User accesses more detailed explanation if needed.
6.  Deciding to Act.
7.  Taking Action: User clicks an action button in Digest or navigates manually.
8.  Implementing Change: System facilitates change (e.g., on Set Lineup screen, possibly with pre-selection).
9.  Confirmation: System saves change; AI Copilot may offer affirmation.

### Scenario B: Responding to a "Critical Alert"
1.  Alert Trigger & Notification: User receives a prominent critical alert (e.g., via AI panel/overlay).
2.  Viewing Alert Details: User interacts with alert; AI panel/overlay shows details.
3.  AI Copilot Provides Actionable Options: Alert includes 1-2 clear options (e.g., bench replacement, waiver suggestion) with explanations.
4.  User Reviews Options & Explanation.
5.  User Selects an Action.
6.  System Facilitates Action (e.g., takes to lineup/waiver screen with proposal).
7.  User Confirms Change.
8.  Confirmation & Next Steps: System processes change; AI Copilot confirms; alert cleared.

## User Flow: Creating a New League (Simplified for PoC)

* **Goal:** A user successfully creates a new fantasy football league with minimal essential settings for the PoC.
* **Persona Focus:** Any user.
* **Pre-conditions:** User logged in, on a screen with "Create League" option.
* **Steps:**
    1.  Initiate League Creation: User clicks "Create New League."
    2.  Simplified "Create League" Form: System presents form.
    3.  User Enters Basic League Details: League Name, Number of Teams (limited options/fixed for PoC), Basic Scoring Rule (limited options/default for PoC). (Other settings use PoC defaults).
    4.  Submit Form: User submits.
    5.  League Creation & Confirmation: System validates, creates league, navigates user to new league's "League Home/Dashboard Screen."
    6.  (Optional for PoC Demo) League Invitation Info: Dashboard shows mock League ID/invite option.

## AI Copilot Panel Interaction Patterns

### Desktop Panel Behavior
- **Default State:** Panel defaults to open on desktop
- **User Control:** User can collapse/hide panel; state is persisted across sessions
- **Auto-Reopen:** Panel auto-reopens for critical alerts
- **Visual Cues:** Visual indicators for non-critical new information when collapsed

### Mobile Access Pattern
- **Access Method:** Via clearly labeled icon triggering an overlay
- **Overlay Design:** Bottom half of screen, allowing interaction with top half
- **Touch Interactions:** Optimized for mobile touch patterns

### Contextual Awareness & Verbosity
- **Screen Context:** Panel content/AI proactivity influenced by user's current screen
- **User Profile:** Behavior adapted based on user archetype/profile
- **Guidance Level:** More guidance for "The Eager Learner" persona

### Unified Message Center
- **Chat History:** Panel serves as unified "chat history" style stream
- **Content Types:** Messages, alerts, and digest summaries
- **Management:** Clear history/dismiss options available

### Onboarding Integration
- **Tour Inclusion:** Onboarding process includes tour/introduction to AI Copilot panel
- **Functionality Demo:** Introduction to panel/icon functionality and features
