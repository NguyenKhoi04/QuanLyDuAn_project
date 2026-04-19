React + TypeScript + Vite
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

@vitejs/plugin-react uses Babel (or oxc when used in rolldown-vite) for Fast Refresh
@vitejs/plugin-react-swc uses SWC for Fast Refresh
React Compiler
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see this documentation.

Expanding the ESLint configuration
If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
You can also install eslint-plugin-react-x and eslint-plugin-react-dom for React-specific lint rules:

// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])





GitScan detected AI API key (Groq) possibly leaked in your public repository.

Details
File: src/services/aiService.js
Line: 3
Commit: 2854597
Snippet (redacted):
const GROQ_API_KEY = "gsk_********************************1My";
Recommended actions
Revoke and rotate this key in the Groq Cloud console.
Remove the secret from your code
Clean it from your Git history if possible
Push a new commit
When you're ready, mark this finding as resolved on GitScan — we'll verify the fix automatically. You can also close this issue from GitHub if you prefer.
