## Infrastructure and Deployment Overview (Proof-of-Concept)

* **Cloud Provider(s) for PoC:** Netlify.
* **Core Services Used (PoC):** Netlify Platform Services (hosting, serverless functions for Next.js API routes, CDN, CI/CD from Git). Google Gemini AI Service (external API). Resend (external API for email). SQLite (file within application bundle/accessible by functions for PoC data).
* **Infrastructure as Code (IaC) for PoC:** Not Applicable (managed by Netlify).
* **Deployment Strategy for PoC:** Continuous Deployment from a designated Git branch via Netlify.
* **Environments for PoC:** Local Development (`localhost`); Production (Demo Environment on Netlify). Optional Netlify Deploy Previews.
* **Environment Promotion for PoC:** Direct push to deployment branch triggers deploy to Netlify demo URL.
* **Rollback Strategy for PoC:** Revert Git commit and re-deploy via Netlify; or Netlify's previous deploy rollback feature.
    * *Architect's Note:* For the hackathon, if SQLite write persistence on Netlify functions proves complex for user profiles, profiles might be temporarily client-side or mocked, with the DAL still designed for SQLite interaction.