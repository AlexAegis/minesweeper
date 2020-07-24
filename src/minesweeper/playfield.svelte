<script lang="ts">
	import Tile from './tile.svelte';

	export let height: number;
	export let width: number;
</script>

<style>
	div {
		background-color: aqua;
		display: grid;
		width: fit-content;
	}
</style>

<div class={$$props.class} style={$$props.style}>
	{#each Array(height) as _, i}
		{#each Array(width) as _, j}
			<Tile x={i} y={j} />
		{/each}
	{/each}
</div>
