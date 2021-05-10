<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { MinesweeperGame } from '../core/minesweeper.class';
	import type { GamePreset } from '../store';
	import { game$, isEnded$ } from '../store';
	import Tile from './tile.svelte';

	export let gamePreset: GamePreset;

	export let game: MinesweeperGame<any> | undefined;

	let mounted = false;

	let tiles: Tile[] = [];

	const tileGetter = (x: number, y: number): Tile => {
		return tiles[y + 1000 * x];
	};

	$: {
		if (mounted) {
			game = new MinesweeperGame<Tile>(
				gamePreset.height,
				gamePreset.width,
				gamePreset.mineCount,
				tileGetter
			);
			game$.next(game);
		}
	}

	onMount(() => (mounted = true));
	onDestroy(() => (mounted = false));

</script>

<div class={$$props.class} style={$$props.style}>
	{#each Array(gamePreset.height) as _, x}
		{#each Array(gamePreset.width) as _, y}
			<Tile bind:this={tiles[y + 1000 * x]} {x} {y} disabled={$isEnded$} />
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
