## Front-End Style Guide (Proof-of-Concept)

This document outlines the core styling philosophy and approach for the Roster Copilot Proof-of-Concept frontend.

  * **Tailwind CSS:** Primary utility-first CSS framework for all styling.
  * **DaisyUI:** Used as a component library providing pre-styled Tailwind CSS components to ensure visual consistency and speed up development. Themes (light/dark) will be managed using DaisyUI's theming capabilities or a compatible Tailwind plugin like `next-themes`.
  * **Global Styles (`app/globals.css`):** Will contain Tailwind base directives, any global style overrides, and potentially base font configurations.