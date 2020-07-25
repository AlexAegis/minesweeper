<script lang="ts">
	import Playfield from './playfield.svelte';
	import { score$, startGame } from './store';

	const x = 10;
	const y = 10;
	const m = 20;

	startGame(x, y, m);
</script>

<style>
	div {
		background-color: #aaa;
		height: 100%;
		display: grid;
		grid-template-rows: 5em auto;
	}

	div :global(.pf) {
		margin: auto;
	}
</style>

<div>
	<h1>MineSweeper</h1>
	<span>{$score$}</span>
	<Playfield class="pf" height={y} width={x} />
</div>
