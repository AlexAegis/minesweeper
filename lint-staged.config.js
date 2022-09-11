// For the glob features check out https://github.com/micromatch/micromatch
export default {
	'*.ts': ['eslint', 'prettier --check'],
	'*.js': ['eslint', 'prettier --check'],
	'*.svelte': ['svelte-check', 'prettier --check'],
	'*.(css|scss)': ['stylelint', 'prettier --check'],
	'(*.config.json|.eslintrc|.prettierrc|.markdownlintrc)': [
		'eslint --max-warnings=0',
		'prettier --check',
	],
	'*.md': ["markdownlint --ignore 'CHANGELOG.md' --ignore-path '.gitignore'", 'prettier --check'],
	'*.(yml|yaml)': ['prettier --check'],
};
