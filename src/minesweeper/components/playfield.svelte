<script lang="ts">
	import Tile from './tile.svelte';

	import {
		gameEnded$,
		gameHeightArray$,
		gameWidthArray$,
		minesweeperActions,
	} from '../store/game.store';
</script>

<div class={$$props.class} style={$$props.style}>
	{#each $gameWidthArray$ as x}
		{#each $gameHeightArray$ as y}
			<Tile
				{x}
				{y}
				disabled={$gameEnded$}
				on:mousedown={(event) => minesweeperActions.leftclickDown.next(event.detail)}
			/>
		{/each}
	{/each}
</div>

<style>
	div {
		display: grid;
		width: fit-content;
		height: fit-content;
		margin: auto;
	}
</style>
