<script lang="ts">
	import type { Field, MinesweeperGame } from './minesweeper';
	import Playfield from './playfield.svelte';
	import Smiley from './smiley.svelte';
	import { height$, width$ } from './store';

	let game!: MinesweeperGame<Field>;
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
	<Smiley on:click={() => game.reset()} />

	<Playfield bind:game height={$height$} width={$width$} class="pf" />
</div>
