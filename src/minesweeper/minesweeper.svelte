<script lang="ts">
	import Playfield from './playfield.svelte';
	import { gamestate$, height$, width$ } from './store';
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
	{$gamestate$}
	<Playfield height={$height$} width={$width$} class="pf" />
</div>
