<script lang="ts">
	import { filter } from 'rxjs/operators';
	import { makeMatrix } from '../helper';
	import type { MinesweeperGame } from './minesweeper';
	import { game$, startGame } from './store';
	import Tile from './tile.svelte';

	export let height: number;
	export let width: number;

	let g = game$.pipe(filter((g): g is MinesweeperGame => !!g));

	// Tile Component references in a matrix
	let tiles: Tile[][] = makeMatrix(width, height);

	function reveal(x: number, y: number): void {
		if ($g) {
			const alsoRevealed = $g.reveal(x, y);
			for (const coord of alsoRevealed) {
				const tile = tiles[coord.x][coord.y];
				if (!(tile as any).revealed) {
					(tile as any).reveal();
				}
			}
		} else {
			startGame(width, height, 20, x, y);
			setTimeout(() => reveal(x, y), 0);
			// Deferring reveal so the stack can empty and game can be filled
		}
	}
</script>

<style>
	div {
		background-color: white;
		display: grid;
		width: fit-content;
	}
</style>

<div class={$$props.class} style={$$props.style}>
	{#each Array(height) as _, x}
		{#each Array(width) as _, y}
			<Tile
				bind:this={tiles[x][y]}
				{x}
				{y}
				value={$g ? $g.getValueOfTile(x, y) : 0}
				on:click={() => reveal(x, y)} />
		{/each}
	{/each}
</div>
<!-- TODO: Change the ternary to optional chaining once terser supports it -->
<!-- https://github.com/terser/terser/issues/567 -->
