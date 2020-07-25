const lol: string = 'lol';
console.log(lol);

import App from './app.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
});

console.log(app);
console.log(App);

export default app;
