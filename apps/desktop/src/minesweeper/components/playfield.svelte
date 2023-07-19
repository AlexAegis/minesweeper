<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { DicedTiles } from '../store';
	import Tile from './tile.svelte';

	export let cheating: boolean;
	export let dicedTiles: DicedTiles;
	$: keys$ = dicedTiles.keys$;
</script>

<div class="playfield {$$props['class'] ?? ''}" style="{$$props['style'] ?? ''}">
	{#each $keys$ as key}
		<Observer observable="{dicedTiles.get(key)}" let:next>
			<Tile {cheating} tile="{next}" on:startFire on:fire on:alternativeFire on:cancelFire />
		</Observer>
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
