module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		ecmaVersion: 2019,
	},
	plugins: ['@typescript-eslint', 'n8n-nodes-base'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:n8n-nodes-base/recommended',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
	},
}; 