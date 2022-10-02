<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { GAME_PRESETS, type GamePreset } from '../consts/game-presets.conts';
	import Button from '../ui/button.svelte';

	const dispatch = createEventDispatcher();

	export let preset: GamePreset;

	function ok() {
		dispatch('ok', preset);
	}

	$: {
		if (preset.mineCount > preset.width * preset.height - 1) {
			preset.mineCount = preset.width * preset.height - 1;
		}
	}
</script>

<div>
	{#each Object.entries(GAME_PRESETS) as [key, data]}
		<Button on:click={() => (preset = data)}>{key}</Button>
	{/each}

	<label for="width">Width:</label>
	<input name="width" type="number" bind:value={preset.width} max="999" min="2" />
	<label for="height">Height:</label>
	<input name="height" type="number" bind:value={preset.height} max="999" min="2" />
	<label for="mineCount">Mine count:</label>
	<input
		name="mineCount"
		type="number"
		bind:value={preset.mineCount}
		max={preset.width * preset.height - 1}
		min="1"
	/>

	<Button on:click={() => ok()}>Ok</Button>
</div>

<style>
	div {
		display: grid;
		gap: 4px;
		padding: 4px;
	}
</style>
