import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.claude', 'playwright-report', 'test-results']),
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Invariants de src/video (voir CLAUDE.md) : rendu déterministe, indépendant de l'éditeur.
    files: ['src/video/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/editor', '**/editor/**'],
              message: 'src/video ne doit jamais dépendre de src/editor.',
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Utiliser random(seed) de Remotion.' },
        { object: 'Date', property: 'now', message: 'Le rendu doit dépendre de la frame.' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'setTimeout', message: 'Interdit dans src/video.' },
        { name: 'setInterval', message: 'Interdit dans src/video.' },
        { name: 'requestAnimationFrame', message: 'Interdit dans src/video.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXOpeningElement[name.name=/^(img|video|audio)$/]',
          message: 'Utiliser les composants Remotion (Img, @remotion/media…).',
        },
      ],
    },
  },
  prettier,
]);
