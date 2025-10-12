import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.js'], // lint only JS
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    ignores: [
      '**/*.ts',     // ignore TypeScript
      '**/*.svelte', // ignore Svelte
      'node_modules',
      'build',
    ],
  },
])
