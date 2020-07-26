<script lang="ts">
	import { Subscription } from 'rxjs';
	import { filter } from 'rxjs/operators';
	import { onDestroy } from 'svelte';
	import { makeMatrix } from '../helper';
	import type { Coordinate, MinesweeperGame } from './minesweeper';
	import { game$, gameState$, isGameAtEndState$, startGame } from './store';
	import type { FlaggedEvent } from './tile';
	import Tile from './tile.svelte';

	export let height: number;
	export let width: number;

	const s = new Subscription();

	// Once terser supports optional chaining this can be removed
	let g = game$.pipe(filter((g): g is MinesweeperGame => !!g));

	// Tile Component references in a matrix
	let tiles: Tile[][] = makeMatrix(width, height);

	function forEachTile(callback: (tile: Tile) => unknown): void {
		for (const row of tiles) {
			for (const tile of row) {
				callback(tile);
			}
		}
	}

	function revealEvery(revealed: Coordinate[]): void {
		for (const coord of revealed) {
			const tile = tiles[coord.x][coord.y];
			if (!(tile as any).revealed) {
				(tile as any).reveal();
			}
		}
	}

	function reveal(x: number, y: number): void {
		if ($game$) {
			try {
				const alsoRevealed = $g.reveal(x, y);
				revealEvery(alsoRevealed);
			} catch (e) {
				if (Array.isArray(e)) {
					revealEvery(e);
					gameState$.next('lost');
					setTimeout(() => {
						game$.next(undefined);
					}, 1000);
				}
			}

			if ($g.haveWon()) {
				forEachTile((tile) => (tile as any).reveal());
				gameState$.next('won');
				setTimeout(() => {
					game$.next(undefined);
				}, 1000);
			}
		} else {
			gameState$.next('ongoing');
			startGame(width, height, 2, x, y);
			setTimeout(() => reveal(x, y), 0);
			// Deferring reveal so the stack can empty and game can be filled
		}
	}

	// Side effect: Hide every field on restart
	s.add(
		game$.pipe(filter((g) => !g)).subscribe(() => {
			forEachTile((tile) => (tile as any)?.hide());
			gameState$.next(undefined);
		})
	);

	// Side effect: State logger
	s.add(
		gameState$
			.pipe(filter((state) => state === 'lost' || state === 'won'))
			.subscribe((state) => {
				console.log(`Game ${state}!`);
			})
	);

	function flagHandler(a: FlaggedEvent) {
		// $g.mark(a.de)
		console.log(a);
	}

	// Clean up subscriptions
	onDestroy(() => s.unsubscribe());
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
				disabled={$isGameAtEndState$}
				value={$g ? $g.getValueOfTile(x, y) : 0}
				on:flagged={flagHandler}
				on:click={() => reveal(x, y)} />
		{/each}
	{/each}
</div>
<!-- TODO: Change the ternary to optional chaining once terser supports it -->
<!-- https://github.com/terser/terser/issues/567 -->
