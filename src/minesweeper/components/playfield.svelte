<script lang="ts">
	import { Subscription } from 'rxjs';
	import { onDestroy, onMount } from 'svelte';
	import { MinesweeperGame } from '../minesweeper';
	import { game$, isEnded$ } from '../store';
	import Tile from './tile.svelte';

	export let width: number;
	export let height: number;
	export let mineCount: number;

	export let game: MinesweeperGame<any> | undefined;
	let s = new Subscription();

	let mounted = false;

	// game$.pipe(delay(200)).subscribe((g) => g?.reset());
	onMount(() => {
		mounted = true;
	});

	const tiles: Tile[] = [];

	function tileGetter(x: number, y: number) {
		return tiles[MinesweeperGame.toLinear(width, x, y)];
	}

	$: game =
		mounted && tiles
			? new MinesweeperGame<Tile>(height, width, mineCount, tileGetter)
			: undefined;
	$: game$.next(game);

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
	{#each Array(height) as _, x}
		{#each Array(width) as _, y}
			<Tile bind:this={tiles[y + width * x]} {x} {y} disabled={$isEnded$} />
		{/each}
	{/each}
</div>
