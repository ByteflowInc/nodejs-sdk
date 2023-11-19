const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/*
 * This is a custom ESLint configuration for use with
 * typescript packages.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
	extends: ['@vercel/style-guide/eslint/node', '@vercel/style-guide/eslint/typescript'].map(require.resolve),
	parserOptions: {
		project,
	},
	globals: {
		React: true,
		JSX: true,
	},
	rules: {
		'unicorn/filename-case': [
			'error',
			{
				cases: {
					camelCase: true,
					pascalCase: true,
				},
			},
		],
		'no-console': 'off',
		'no-restricted-syntax': [
			'error',
			{
				selector: "CallExpression[callee.object.name='console'][callee.property.name!=/^(warn|error|info|trace)$/]",
				message: 'Unexpected property on console object was called',
			},
		],
	},
	settings: {
		'import/resolver': {
			typescript: {
				project,
			},
		},
	},
	ignorePatterns: ['node_modules/', 'dist/'],
};
