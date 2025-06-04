## Branching Strategy: Simplified Gitflow Hybrid

This strategy aims to provide a clear structure for development, releases, and maintenance without the full complexity of traditional Gitflow, making it suitable for the current phase of the Praxius project. It emphasizes a stable `main` branch and a `develop` branch for ongoing work, with feature branches for new development.

### Core Branches:

1.  **`main` (or `master`)**
    *   **Purpose:** This branch represents the most stable, production-ready code. It should always be deployable.
    *   **Workflow:** Code is merged into `main` from `release` branches or, for urgent fixes, from `hotfix` branches. Direct commits to `main` are generally disallowed.
    *   **Tagging:** Each merge into `main` should be tagged with a version number (e.g., `v1.0.0`, `v1.0.1`).

2.  **`develop`**
    *   **Purpose:** This is the primary integration branch for ongoing development. It contains the latest delivered development changes for the next release.
    *   **Workflow:** Feature branches are merged into `develop` after they are completed and reviewed. `develop` should be kept relatively stable, and CI/CD can be run against it.

### Supporting Branches:

1.  **`feature/<feature-name>`** (e.g., `feature/user-authentication`, `feature/cms-article-collection`)
    *   **Purpose:** Used for developing new features or making significant changes.
    *   **Workflow:**
        *   Branched off `develop`.
        *   Work is done in isolation on this branch.
        *   Once the feature is complete and tested, a Pull Request (PR) is created to merge it back into `develop`.
        *   Code reviews should be conducted before merging.
        *   Should be deleted after merging into `develop`.
    *   **Naming:** Use a descriptive name prefixed with `feature/`. Use hyphens for spaces.

2.  **`release/<version-number>`** (e.g., `release/v1.0.0`, `release/v1.1.0`)
    *   **Purpose:** Used to prepare for a new production release. This branch allows for final testing, bug fixing, and documentation updates specific to the release.
    *   **Workflow:**
        *   Branched off `develop` when `develop` has reached a stable point and is ready for release.
        *   Only bug fixes, documentation generation, and other release-oriented tasks should happen here. No new features.
        *   Once the release branch is stable and ready, it is merged into `main` (and tagged) and also merged back into `develop` to ensure any fixes made in the release branch are incorporated into future development.
        *   Should be deleted after merging to `main` and `develop`.

3.  **`hotfix/<issue-description-or-ticket-id>`** (e.g., `hotfix/login-bug-123`, `hotfix/critical-security-patch`)
    *   **Purpose:** Used to address urgent issues found in the `main` (production) branch that cannot wait for the next regular release cycle.
    *   **Workflow:**
        *   Branched off `main` (from the corresponding tagged version).
        *   The fix is applied and tested on this branch.
        *   Once complete, the hotfix branch is merged directly into `main` (and tagged with an incremented patch version, e.g., `v1.0.1`).
        *   It must also be merged back into `develop` (and any active `release` branches) to ensure the fix is not lost in subsequent releases.
        *   Should be deleted after merging.

### Workflow Summary:

1.  **New Feature Development:**
    *   Create `feature/my-new-feature` from `develop`.
    *   Develop the feature, commit regularly.
    *   When complete, create a Pull Request to merge `feature/my-new-feature` into `develop`.
    *   After review and merge, delete the feature branch.

2.  **Release Preparation:**
    *   When `develop` is ready for a release, create `release/vx.y.z` from `develop`.
    *   Perform final testing and bug fixes on the release branch.
    *   Merge `release/vx.y.z` into `main` and tag it (e.g., `vx.y.z`).
    *   Merge `release/vx.y.z` back into `develop`.
    *   Delete the release branch.

3.  **Hotfix:**
    *   If a critical bug is found in `main`, create `hotfix/bug-fix-description` from `main` (from the specific tag).
    *   Fix the bug and commit.
    *   Merge `hotfix/bug-fix-description` into `main` and tag it (e.g., `vx.y.z+1`).
    *   Merge `hotfix/bug-fix-description` into `develop` (and any active `release` branch).
    *   Delete the hotfix branch.

### Mermaid Diagram:

\\\mermaid
graph LR
    subgraph "Production"
        M["main (v1.0.0)"] --- M2["main (v1.0.1)"]
    end

    subgraph "Integration"
        D["develop"]
    end

    subgraph "Feature Development"
        F1["feature/feat-A"]
        F2["feature/feat-B"]
    end

    subgraph "Release Cycle"
        R1["release/v1.0.0"]
    end

    subgraph "Hotfix Cycle"
        H1["hotfix/urgent-fix"]
    end

    D --> F1
    D --> F2
    F1 --> D
    F2 --> D
    D --> R1
    R1 --> M
    R1 --> D
    M --> H1
    H1 --> M2
    H1 --> D
\\\

### Rationale:

*   **Clarity:** Provides clear separation between stable production code (`main`), ongoing development (`develop`), and new features (`feature/...`).
*   **Flexibility:** Allows for parallel development of multiple features.
*   **Release Management:** The `release` branches provide a dedicated space for preparing and stabilizing releases.
*   **Hotfixes:** A clear process for addressing urgent production issues.
*   **Scalability:** This model can scale with the project. If CI/CD is implemented, `develop` can be a target for automated builds and tests, and `main` for deployments.