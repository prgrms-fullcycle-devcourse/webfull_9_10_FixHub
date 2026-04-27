const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefreshModule = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');

const reactRefresh = reactRefreshModule.default ?? reactRefreshModule;
const INTERNAL_IMPORT_PATTERN = /^(@\/|\.)/u;
const CAMEL_CASE_AND_PASCAL_CASE_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*$/u;

const fixhubPlugin = {
  rules: {
    'import-groups': {
      meta: {
        type: 'layout',
        docs: {
          description:
            'Keep external imports before internal imports with a blank line between them.',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const imports = node.body.filter(
              (statement) => statement.type === 'ImportDeclaration',
            );
            let seenInternalImport = false;

            for (const declaration of imports) {
              const source = declaration.source.value;

              if (typeof source !== 'string') {
                continue;
              }

              const isInternalImport = INTERNAL_IMPORT_PATTERN.test(source);

              if (isInternalImport) {
                seenInternalImport = true;
                continue;
              }

              if (seenInternalImport) {
                context.report({
                  node: declaration,
                  message:
                    'External imports should be declared before internal imports.',
                });
              }
            }

            for (let index = 1; index < imports.length; index += 1) {
              const previousImport = imports[index - 1];
              const currentImport = imports[index];
              const previousSource = previousImport.source.value;
              const currentSource = currentImport.source.value;

              if (
                typeof previousSource !== 'string' ||
                typeof currentSource !== 'string'
              ) {
                continue;
              }

              const previousIsExternal =
                !INTERNAL_IMPORT_PATTERN.test(previousSource);
              const currentIsInternal =
                INTERNAL_IMPORT_PATTERN.test(currentSource);
              const hasBlankLineBetweenImports =
                currentImport.loc.start.line - previousImport.loc.end.line > 1;

              if (
                previousIsExternal &&
                currentIsInternal &&
                !hasBlankLineBetweenImports
              ) {
                context.report({
                  node: currentImport,
                  message:
                    'Add a blank line between external and internal imports.',
                });
              }
            }
          },
        };
      },
    },
    'camel-case-path': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Keep source folder and file names in camelCase.',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.filename.replaceAll('\\', '/');
            const sourcePath = filename.split('/src/')[1];

            if (!sourcePath) {
              return;
            }

            const pathParts = sourcePath.split('/');
            const invalidPart = pathParts.find((part) => {
              const name = part
                .replace(/\.d\.ts$/u, '')
                .replace(/\.[^.]+$/u, '');

              return (
                name.length > 0 &&
                !CAMEL_CASE_AND_PASCAL_CASE_PATTERN.test(name)
              );
            });

            if (!invalidPart) {
              return;
            }

            context.report({
              node,
              message: `Source folder and file names should use camelCase: ${invalidPart}`,
            });
          },
        };
      },
    },
    'plural-array-name': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Keep array variable names plural.',
        },
        schema: [],
      },
      create(context) {
        function isArrayTypeAnnotation(typeAnnotation) {
          if (!typeAnnotation) {
            return false;
          }

          if (typeAnnotation.type === 'TSArrayType') {
            return true;
          }

          if (typeAnnotation.type !== 'TSTypeReference') {
            return false;
          }

          return (
            typeAnnotation.typeName.type === 'Identifier' &&
            ['Array', 'ReadonlyArray'].includes(typeAnnotation.typeName.name)
          );
        }

        return {
          VariableDeclarator(node) {
            if (node.id.type !== 'Identifier') {
              return;
            }

            const name = node.id.name;
            const typeAnnotation = node.id.typeAnnotation?.typeAnnotation;
            const hasArrayValue = node.init?.type === 'ArrayExpression';
            const hasArrayType = isArrayTypeAnnotation(typeAnnotation);

            if ((hasArrayValue || hasArrayType) && !name.endsWith('s')) {
              context.report({
                node: node.id,
                message: `Array variable names should be plural: ${name}`,
              });
            }
          },
        };
      },
    },
  },
};

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['*.config.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['apps/backend/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'react-refresh/only-export-components': [
        'error',
        {
          allowExportNames: ['buttonVariants'],
        },
      ],
    },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    plugins: {
      fixhub: fixhubPlugin,
    },
    rules: {
      'fixhub/camel-case-path': 'error',
      'fixhub/import-groups': 'error',
      'fixhub/plural-array-name': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          format: null,
        },
      ],
    },
  },
];
