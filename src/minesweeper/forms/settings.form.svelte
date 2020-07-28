<script lang="ts">
	import type { GamePreset } from '../store';

	export let width: number;
	export let height: number;
	export let mineCount: number;

	function setTo(gamePreset: GamePreset) {
		width = gamePreset.width;
		height = gamePreset.height;
		mineCount = gamePreset.mineCount;
	}
</script>

<div>
	<!--{#each Object.entries(presets) as [key, data]}
		<Button on:click={() => setTo(data)}>{key}</Button>
	{/each}-->

	<label for="width">Width:</label>
	<input name="width" type="number" bind:value={width} />
	<label for="height">Height:</label>
	<input name="height" type="number" bind:value={height} />
	<label for="mineCount">Mine count:</label>
	<input name="mineCount" type="number" bind:value={mineCount} />
</div>
