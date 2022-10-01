<script lang="ts">
	import { gameHeightArray$, gameWidthArray$ } from '../store/game.store';
	import TileWrapper from './tile-wrapper.svelte';
</script>

<div class={$$props.class} style={$$props.style}>
	{#each $gameWidthArray$ as x}
		{#each $gameHeightArray$ as y}
			<TileWrapper {x} {y} />
		{/each}
	{/each}
</div>

<style>
	div {
		display: grid;
		width: fit-content;
		height: fit-content;
		margin: auto;
	}
</style>
