<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GamePreset } from '../consts/game-presets.conts';
	import { presets$ } from '../store/game.store';
	import { debug$ } from '../store/root.store';
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
	{#each Object.entries($presets$) as [key, data]}
		<Button on:click={() => (preset = data)}>{key}</Button>
	{/each}

	<div class="field-row">
		<label for="width">Width:</label>
		<input name="width" type="number" bind:value={preset.width} max="999" min="2" />
	</div>

	<div class="field-row">
		<label for="height">Height:</label>
		<input name="height" type="number" bind:value={preset.height} max="999" min="2" />
	</div>

	<div class="field-row">
		<label for="mineCount">Mine count:</label>
		<input
			name="mineCount"
			type="number"
			bind:value={preset.mineCount}
			max={preset.width * preset.height - 1}
			min="1"
		/>
	</div>

	<Button on:click={() => ok()}>Ok</Button>

	{#await $debug$}
		loading...
	{:then debug}
		{#if !debug}
			<Button on:click={() => debug$.set(true)}>Enable Debug</Button>
		{:else}
			<Button on:click={() => debug$.set(false)}>Disable Debug</Button>
		{/if}
	{/await}
</div>

<style>
	div {
		display: grid;
		gap: 4px;
		padding: 4px;
	}
</style>
