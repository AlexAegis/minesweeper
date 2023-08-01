

import config from '@alexaegis/autotool-plugin-prettier/prettier-config';

/** @type {import('prettier').Config} */
export default {
	...config,
	plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss']
};
