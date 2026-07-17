<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import type { Slice } from '@tinyslice/core';
	import type { GameInstance, TileState } from '../store';
	import Tile from './tile.svelte';

	interface Props {
		cheating: boolean;
		tileSlice: Slice<GameInstance, Record<`${number},${number}`, TileState>>;
		class?: string | undefined;
		style?: string | undefined;
		onStartFire?: ((coordinate: CoordinateLike) => void) | undefined;
		onFire?: ((coordinate: CoordinateLike) => void) | undefined;
		onAlternativeFire?: ((coordinate: CoordinateLike) => void) | undefined;
		onCancelFire?: ((coordinate: CoordinateLike) => void) | undefined;
	}

	let {
		cheating,
		tileSlice,
		class: className = '',
		style = '',
		onStartFire = undefined,
		onFire = undefined,
		onAlternativeFire = undefined,
		onCancelFire = undefined,
	}: Props = $props();
</script>

<div class="playfield {className}" {style}>
	{#each Object.values($tileSlice) as tile (`${tile.x.toString()},${tile.y.toString()}`)}
		<Tile {cheating} {tile} {onStartFire} {onFire} {onAlternativeFire} {onCancelFire} />
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
