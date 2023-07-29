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
		padding: 0;
		padding: 3px;
		margin: 0;
		box-shadow:
			inset -1px -1px var(--win-3d-objects-color-lighter-2),
			inset 1px 1px var(--win-3d-objects-color-darker-1),
			inset -2px -2px var(--win-3d-objects-color-lighter-2),
			inset 2px 2px var(--win-3d-objects-color-darker-1),
			inset -3px -3px var(--win-3d-objects-color-lighter-2),
			inset 3.25px 3.25px var(--win-3d-objects-color-darker-1) !important;
	}
</style>
