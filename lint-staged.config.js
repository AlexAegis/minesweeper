// For the glob features check out https://github.com/micromatch/micromatch
module.exports = {
	'*.ts': ['eslint', 'prettier --check'],
	'*.js': ['eslint', 'prettier --check'],
	'*.svelte': ['svelte-check', 'prettier --check'],
	'*.css': ['stylelint', 'prettier --list-different'],
	'*.scss': ['stylelint --syntax=scss', 'prettier --check'],
	'(*.json|.eslintrc|.prettierrc|.stylelintrc|.markdownlintrc)': [('eslint', 'prettier --check')],
	'*.md': ["markdownlint --ignore 'CHANGELOG.md' --ignore-path '.gitignore'", 'prettier --check'],
	'*.(yml|yaml)': ['yamllint', 'prettier --check'],
};
