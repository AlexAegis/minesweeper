<script lang="ts">
	import { Subscription } from 'rxjs';
	import { onDestroy, onMount } from 'svelte';
	import { MinesweeperGame } from '../minesweeper';
	import { game$, GamePreset, isEnded$ } from '../store';
	import Tile from './tile.svelte';

	export let gamePreset: GamePreset;

	export let game: MinesweeperGame<any> | undefined;
	let s = new Subscription();

	let mounted = false;

	// game$.pipe(delay(200)).subscribe((g) => g?.reset());
	onMount(() => {
		mounted = true;
	});

	let tiles: Tile[] = [];

	function tileGetter(x: number, y: number) {
		// A plus one size of "seam" is required to prevent detecting neighbours
		// on the next or previous line from the edges
		return tiles[y + (gamePreset.width + 1) * x];
	}

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

	onDestroy(() => {
		mounted = false;
		s.unsubscribe();
	});
</script>

<style>
	div {
		display: grid;
		width: fit-content;
		height: fit-content;
		margin: auto;
	}
</style>

<div class={$$props.class} style={$$props.style}>
	{#each Array(gamePreset.height) as _, x}
		{#each Array(gamePreset.width) as _, y}
			<Tile bind:this={tiles[y + (gamePreset.width + 1) * x]} {x} {y} disabled={$isEnded$} />
		{/each}
	{/each}
</div>
