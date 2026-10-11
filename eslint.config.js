import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const FEATURES = ['hero', 'highlights', 'projects', 'stack', 'career', 'contact', 'auth', 'profile'];

export default tseslint.config(
  {
    ignores: [
      'build',
      'coverage',
      '.react-router',
      'public/mockServiceWorker.js',
      'playwright-report',
      'test-results',
      '*.tmp.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y, 'import-x': importX },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/prop-types': 'off',
      // jsx-a11y no ve el <label> que Field asocia al control clonado
      'jsx-a11y/label-has-associated-control': 'off',
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],

      // Arquitectura por features: shared → features → app
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            // features aisladas entre sí
            ...FEATURES.map((f) => ({
              target: `./src/features/${f}`,
              from: './src/features',
              except: [`./${f}`],
              message:
                'Una feature no puede importar de otra: mueve lo común a src/components, src/lib o src/api.',
            })),
            {
              target: './src/features',
              from: './src/app',
              message: 'Las features no dependen de la capa app.',
            },
            {
              target: [
                './src/components',
                './src/lib',
                './src/hooks',
                './src/utils',
                './src/types',
                './src/api',
                './src/config',
              ],
              from: ['./src/features', './src/app'],
              message: 'La capa compartida no puede depender de features ni de app.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/api/public-portfolio/static-source', '@/api/public-portfolio/http-source'],
              message: 'Usa createPortfolioSource() desde source.ts',
            },
          ],
        },
      ],
      // textos visibles por i18n (los datos del contrato y símbolos se permiten)
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: [
            '·',
            '—',
            '↗',
            '/',
            ':',
            '(',
            ')',
            '…',
            ' ',
            'JF',
            'PDF',
            'LinkedIn',
            'GitHub',
            'mailto:',
          ],
        },
      ],
    },
  },
  {
    // la fuente y las pruebas sí pueden importar las implementaciones concretas
    files: ['src/api/public-portfolio/**', 'src/testing/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      'react/jsx-no-literals': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['src/components/illustrations/**', 'src/app/routes/admin/login.tsx'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
);
