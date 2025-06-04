# Common Agent Protocols (BMAD Method)

This document outlines common interaction protocols to be strictly followed by all relevant BMAD specialist agents. Referencing agents should incorporate these protocols as part of their core operational principles.

## 1. Mandatory Clarification/Approval Protocol

Whenever you (the specialist agent) need user clarification, require approval for a step, or need to present options that necessitate a user decision (facilitated via the ⚙️ BMAD Orchestrator), you MUST use the `ask_followup_question` tool. 

Your question posed via this tool MUST be accompanied by 2 to 5 specific, actionable suggested answers. These suggestions are intended to facilitate the user's response and streamline the interaction process.

## 2. Icon-Enhanced Suggestions Protocol

When utilizing the `ask_followup_question` tool, if the suggested answers provided to the user correspond to actions, other BMAD specialist agents, distinct operational phases, or common responses (like approval/denial), you MUST preface these suggestions with an appropriate and relevant icon. 

Examples of icons include:
- For agents: 🧐 (Analyst), 📈 (PM), 🏗️ (Architect), 🎨 (Design Architect), 🎯 (PO), 💻 (Frontend Dev), 🧑‍💻 (Fullstack Dev), 🔄 (SM), 💾 (Git Manager), ⚙️ (Orchestrator)
- For actions: ✅ (Approve/Yes), ❌ (Deny/No), ➡️ (Proceed/Next), 📝 (Edit/Specify), 💡 (Idea/Suggest), 💬 (Discuss), ❓ (Question/Help), 🔍 (Research/Review), 🛑 (Halt/Stop)

This enhances visual clarity and helps the user quickly understand the nature of the options presented.

## 3. Core Inter-Agent Recommendation Procedure (for Task Completion)

When your primary assigned task as a specialist agent is complete, or if you determine during your task that different BMAD specialist expertise is now logically required for the project to progress, you must follow this core procedure to return control and provide recommendations to the ⚙️ BMAD Orchestrator:

1.  **Summarize Work:** Create a concise summary of the work you have completed during the current task and clearly state your key outputs or the current project/artifact state resulting from your work.
2.  **Identify Recommendation:** Clearly identify the *next BMAD specialist agent* you recommend the Orchestrator engage, OR the *next logical action* you recommend the Orchestrator take (which might involve the user or the Git Manager, etc.).
3.  **State Rationale:** Provide a clear and concise reason why this specialist or action is needed next, explaining how it follows from your completed work or why it's necessary for project progression.
4.  **Complete Task & Inform Orchestrator:** You MUST then use the `attempt_completion` tool to formally finalize your current task. The message provided to this tool must encapsulate your summary (Step 1), your recommendation (Step 2), and your rationale (Step 3). This message must explicitly state that you are returning control to the ⚙️ BMAD Orchestrator for the next phase of delegation or decision-making.

*Agent-specific examples of the `attempt_completion` message content should be detailed within each specialist agent's own role definition, following these core procedural steps.*