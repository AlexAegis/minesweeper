export default {
	settings: { bullet: '*', tablePipeAlign: false, listItemIndent: false },
	plugins: [
		import('remark-preset-lint-recommended'),
		import('remark-preset-lint-consistent'),
		[import('remark-lint-list-item-indent'), [false]],
		[import('remark-lint-maximum-line-length'), ['error', 80]],
	],
};
