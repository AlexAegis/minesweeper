<script lang="ts">
	import type { Slice } from '@tinyslice/core';
	import type { GameInstance, TileState } from '../store';
	import Tile from './tile.svelte';

	export let cheating: boolean;
	export let tileSlice: Slice<GameInstance, Record<`${number},${number}`, TileState>>;
</script>

<div class="playfield {$$props['class'] ?? ''}" style="{$$props['style'] ?? ''}">
	{#each Object.values($tileSlice) as tile}
		<Tile {cheating} {tile} on:startFire on:fire on:alternativeFire on:cancelFire />
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
