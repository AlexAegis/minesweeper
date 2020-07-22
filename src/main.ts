const lol: string = 'lol';
console.log(lol);

import App from './app.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
});

export default app;
