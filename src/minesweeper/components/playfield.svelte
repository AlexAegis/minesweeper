<script lang="ts">
	import type { Observable } from 'rxjs';
	import { Observer } from 'svelte-rxjs-observer';
	import type { TileState } from '../store';
	import { debug$ } from '../store/root.store';
	import Tile from './tile.svelte';

	export let gameHeightArray$: Observable<number[]>;
	export let gameWidthArray$: Observable<number[]>;
	export let getGameTileState: (x: number, y: number) => Observable<TileState>;
</script>

<div class="playfield {$$props.class ?? ''}" style={$$props.style ?? ''}>
	{#each $gameHeightArray$ as y}
		{#each $gameWidthArray$ as x}
			<Observer observable={getGameTileState(x, y)} let:next>
				<Tile
					debug={$debug$}
					tile={next}
					on:leftclickDown
					on:leftclickUp
					on:rightclickUp
					on:mouseleave
				/>
			</Observer>
		{/each}
	{/each}
</div>

<style lang="scss">
	.playfield {
		display: grid;
		width: fit-content;
		height: fit-content;
		margin: auto;

		background-color: #a6a6a6; // same as border color to avoid color bleed
	}
</style>
