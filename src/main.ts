import '98.css/dist/98.css';
import 'normalize.css/normalize.css';
import './app.scss';
import App from './app.svelte';
import './minesweeper.scss';

const app = new App({
	target: document.body,
});

export default app;
