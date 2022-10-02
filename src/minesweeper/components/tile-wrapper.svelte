<script lang="ts">
	import { getGameTileState, minesweeperActions } from '../store/game.store';

	import Tile from './tile.svelte';

	export let x: number;
	export let y: number;
	const tile$ = getGameTileState(x, y);
</script>

{#await $tile$}
	<div class="fake-tile" />
{:then tile}
	{#if tile}
		<Tile
			{tile}
			on:leftclickDown={(event) =>
				minesweeperActions.clickActions.leftclickDown.next(event.detail)}
			on:leftclickUp={(event) =>
				minesweeperActions.clickActions.leftclickUp.next(event.detail)}
			on:rightclickUp={(event) =>
				minesweeperActions.clickActions.rightclickUp.next(event.detail)}
		/>
	{:else}
		<div class="fake-tile" />
	{/if}
{/await}

<style>
	.fake-tile {
		border-style: solid;
		border-color: #a6a6a6;
		border-width: 1px;
	}
</style>
