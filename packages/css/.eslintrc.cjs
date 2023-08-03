// managed-by-autotool

/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: [
		'../../.eslintrc.cjs',
		'@alexaegis/eslint-config-svelte',
		'@alexaegis/eslint-config-vitest',
	],
};
