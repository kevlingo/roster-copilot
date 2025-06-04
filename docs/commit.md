# Commit Message Conventions

## Purpose

Clear, consistent, and descriptive commit messages are crucial for:
- Understanding the history of changes in the repository.
- Facilitating code reviews.
- Helping team members (including AI agents) understand the context of changes.
- Enabling automated tools (e.g., for generating changelogs or triggering CI/CD actions).

## General Format

Each commit message consists of a **header** (subject line), an optional **body**, and an optional **footer**.

The overall structure is:

<type>(<optional_scope>): <subject>

<optional_body>

<optional_footer>

A blank line MUST separate the header from the body, and the body from the footer (if a footer is present).

### Header (Subject Line)

The header is mandatory and should be a single line summarizing the change.

- **Type:** Describes the kind of change being made. Must be one of the allowed types (see "Allowed Types" below).
- **Scope (Optional):** Specifies the part of the codebase affected by the change (e.g., `auth`, `ui-button`, `api-v2`, `story-1.3`). Keep scopes concise and use lowercase.
- **Subject:** A short summary of the change.
    - Use imperative, present tense: "Add feature" not "Added feature" or "Adds feature."
    - Do not capitalize the first letter (unless it's a proper noun or references a scope like a Story ID).
    - No period (.) at the end.
    - Aim for 50 characters or less, but up to 72 characters is acceptable.

### Allowed Types:

* **`feat`**: A new feature (correlates with a new user story or feature implementation).
* **`fix`**: A bug fix (correlates with fixing an issue in existing code).
* **`docs`**: Documentation only changes.
* **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
* **`refactor`**: A code change that neither fixes a bug nor adds a feature.
* **`perf`**: A code change that improves performance.
* **`test`**: Adding missing tests or correcting existing tests.
* **`build`**: Changes that affect the build system or external dependencies (e.g., Gulp, Webpack, NPM).
* **`ci`**: Changes to our CI configuration files and scripts.
* **`chore`**: Other changes that don't modify `src` or `test` files (e.g., updating `gitignore`, project configuration).
* **`revert`**: Reverts a previous commit.

### Body (Optional)

- Use the body to explain *what* and *why* vs. *how*.
- Separate the subject from the body with a blank line.
- Wrap the body at 72 characters per line.
- Can include more detailed descriptions, justification for the change, or pointers to further information.

### Footer (Optional)

- Separate the body from the footer with a blank line.
- **Breaking Changes:** All breaking changes MUST be mentioned in the footer. Start the footer block with `BREAKING CHANGE:` (followed by a colon and a space or two newlines). The rest of the commit message footer is then the description of the breaking change, justification, and migration notes.
- **Issue/Story Linking:** Reference related issues or story IDs using keywords.
    - For BMAD stories, clearly reference the story ID, for example:
        - `Story 1.3`
        - `Relates to Story 1.3`
        - `Closes Story 2.5` (if the commit fully resolves the story)
    - For other issue trackers: `Closes #472`, `Fixes #456`.

## Examples

**Example 1: New Feature with Scope and Story ID**

```
feat(auth): add password reset via email

Implements the password reset functionality where users can request
a password reset link to be sent to their registered email address.

Story 1.3
```

**Example 2: Bug Fix with Scope and Issue ID**

```
fix(ui-checkout): correct cart total calculation error

The cart total was not properly updating when quantities were changed
for items with discounts. This commit fixes the rounding and update logic.

Closes #472
Relates to Story 2.7
```

**Example 3: Documentation Update**

```
docs(readme): update setup instructions for new dev environment
```

**Example 4: Refactor with Breaking Change**

```
refactor(core-api): overhaul user session management

The previous session handling was prone to race conditions. This change
introduces a new Redis-backed session store for improved reliability
and scalability.

BREAKING CHANGE: The structure of the session object has changed.
API consumers relying on the old session format will need to update
their integration. Refer to `docs/api/v2/session-migration.md`.
```

## AI Agent Commit Message Generation

When BMAD AI agents (e.g., the Orchestrator, or the Developer Agent proposing a message) generate or propose commit messages, they should strive to:
1.  Strictly adhere to the `<type>(<optional_scope>): <subject>` format.
2.  Accurately infer the `<type>` based on the nature of the story or changes (e.g., new functionality = `feat`, bug fix = `fix`).
3.  Include the relevant Story ID (e.g., `Story 1.3`) clearly in the scope or footer.
4.  Generate a concise, imperative subject line reflecting the story's main goal or the commit's primary change.
5.  If significant details are provided by the Developer agent upon story completion (or are inherent to the story's description), these can be used to populate the commit body, explaining the "what" and "why."
6.  The Orchestrator MUST always allow for user review, modification, or complete override of any AI-generated commit message before instructing the `bmad-git-manager` to perform the commit.