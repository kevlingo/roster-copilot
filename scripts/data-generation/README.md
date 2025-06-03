# Static Data Generation Scripts

This directory contains scripts for generating static data for the Roster Copilot PoC.

## `generate-static-data.ts`

This script generates `nfl-players.json` and `nfl-games.json` and places them in the `data/static-nfl-data/` directory.

### Dependencies

- `@faker-js/faker`: Used to generate fictional data.
- `ts-node`: Used to execute the TypeScript script. (Ensure it's installed as a dev dependency: `npm install ts-node --save-dev`)

### Running the Script

1.  Ensure `ts-node` and `@faker-js/faker` are installed.
2.  The project's `package.json` should be configured with `"type": "module"` and `tsconfig.json` should have `"module": "NodeNext"` (or similar ESM-compatible settings like `esnext` with `bundler` for moduleResolution) and the following `ts-node` configuration:
    ```json
    "ts-node": {
      "esm": true,
      "experimentalSpecifierResolution": "node"
    }
    ```
3.  Execute the script from the project root using:
    ```bash
    node --loader ts-node/esm ./scripts/data-generation/generate-static-data.ts
    ```

    This command uses Node.js with the `ts-node/esm` loader, which is suitable for running ESM TypeScript files directly, especially with newer Node.js versions.

    **Note on Temporary Configuration Changes for Script Execution:**
    During development of Story 1.0.1, the above configurations for `package.json` and `tsconfig.json` were applied temporarily to enable script execution due to issues with the project's default execution environment for standalone scripts. These changes were reverted after the script was successfully run to avoid impacting the main Next.js application build. If you need to re-run this script and encounter issues, you may need to temporarily re-apply these ESM configurations.