<script lang="ts">
	import { onMount } from 'svelte';
	import DigitDisplay from './components/digit-display.svelte';
	import Menu from './components/menu.svelte';
	import Panel from './components/panel.svelte';
	import Playfield from './components/playfield.svelte';
	import Smiley from './components/smiley.svelte';
	import type { Field, MinesweeperGame } from './minesweeper';
	import { assetMap, elapsedTime$, height$, remainingMines$, width$ } from './store';

	let game!: MinesweeperGame<Field>;

	onMount(() => {
		// Preloading assets
		for (const path of Object.values(assetMap)) new Image().src = path;
	});
</script>

<style>
	.game {
		display: grid;
		grid-auto-rows: 1fr;
		grid-auto-columns: 1fr;
		height: fit-content;
		width: fit-content;
		box-sizing: border-box;
		grid-template-rows: auto 5em auto;
		margin: auto;
	}
</style>

<div class="panel outset game padded">
	<Menu />
	<Panel class="panel inset padded">
		<DigitDisplay value={$remainingMines$} paddedLength={3} />
		<Smiley on:click={() => game.reset()} />
		<DigitDisplay value={$elapsedTime$} paddedLength={3} />
	</Panel>
	<Playfield class="panel inset" bind:game height={$height$} width={$width$} />
</div>
