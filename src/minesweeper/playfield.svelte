<script lang="ts">
	import type { MinesweeperGame } from './minesweeper';
	import Tile from './tile.svelte';
	import { game$ } from './store';
	import { filter } from 'rxjs/operators';

	export let height: number;
	export let width: number;

	let g = game$.pipe(filter((g): g is MinesweeperGame => !!g));
	let game = $g;

	let tiles: Tile[][] = [];
	for (let x = 0; x < height; x++) {
		tiles[x] = [];
	}

	function reveal(x: number, y: number) {
		if (game) {
			const alsoRevealed = game.reveal(x, y);
			for (const coord of alsoRevealed) {
				const tile = tiles[coord.x][coord.y];
				console.log('reveal', tile, coord);
				if (!(tile as any).revealed) {
					(tile as any).reveal();
				}
			}
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

{#if game}
	<div class={$$props.class} style={$$props.style}>
		{#each Array(height) as _, x}
			{#each Array(width) as _, y}
				<Tile bind:this={tiles[x][y]} {x} {y} value={game.getValueOfTile(x, y)} on:click={() => reveal(x, y)} />
			{/each}
		{/each}
	</div>
{/if}
