<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../components/button.svelte';
	import { GAME_PRESETS, type GamePreset } from '../consts/game-presets.conts';

	const dispatch = createEventDispatcher();

	export let width: number;
	export let height: number;
	export let mineCount: number;

	function setTo(gamePreset: GamePreset) {
		width = gamePreset.width;
		height = gamePreset.height;
		mineCount = gamePreset.mineCount;
		dispatch('done');
	}

	$: {
		if (mineCount > width * height - 1) {
			mineCount = width * height - 1;
		}
	}
</script>

<div>
	{#each Object.entries(GAME_PRESETS) as [key, data]}
		<Button on:click={() => setTo(data)}>{key}</Button>
	{/each}

	<label for="width">Width:</label>
	<input name="width" type="number" bind:value={width} max="999" min="2" />
	<label for="height">Height:</label>
	<input name="height" type="number" bind:value={height} max="999" min="2" />
	<label for="mineCount">Mine count:</label>
	<input name="mineCount" type="number" bind:value={mineCount} max={width * height - 1} min="1" />
</div>

<style>
	div {
		display: grid;
		gap: 4px;
		padding: 4px;
	}
</style>
