<script lang="ts">
	import Playfield from './playfield.svelte';
	import { score$ } from './store';

	const x = 10;
	const y = 10;
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
