<script lang="ts">
	import { Subscription } from 'rxjs';
	import { onDestroy, onMount } from 'svelte';
	import { makeMatrix } from '../helper';
	import { MinesweeperGame } from './minesweeper';
	import { game$, isEnded$, mineCount$ } from './store';
	import Tile from './tile.svelte';

	export let width: number;
	export let height: number;

	export let game: MinesweeperGame<any>;
	let s = new Subscription();

	let mounted = false;
	$: tiles = makeMatrix<Tile>(width, height);
	$: {
		if (mounted) {
			game = new MinesweeperGame<Tile>(width, height, tileGetter);
			game.setMineCount($mineCount$);
			game$.next(game);
		}
	}

	onMount(() => {
		mounted = true;
	});

	function tileGetter(x: number, y: number) {
		const t = tiles[x][y];
		return t;
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
	{#each Array(height) as _, x}
		{#each Array(width) as _, y}
			<Tile bind:this={tiles[x][y]} {x} {y} disabled={$isEnded$} />
		{/each}
	{/each}
</div>
