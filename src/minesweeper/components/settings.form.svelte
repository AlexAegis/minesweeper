<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GamePreset } from '../consts/game-presets.conts';
	import { presets$ } from '../store/game.store';
	import Button from '../ui/button.svelte';

	const dispatch = createEventDispatcher();

	export let preset: GamePreset;

	function ok() {
		dispatch('ok', preset);
	}

	function cancel() {
		dispatch('cancel');
	}

	$: {
		if (preset.mineCount > preset.width * preset.height - 1) {
			preset.mineCount = preset.width * preset.height - 1;
		}
	}
</script>

<div class="custom-settings">
	<form on:submit|preventDefault={ok}>
		<div class="inputs">
			<div class="field-row">
				<label for="height">Height:</label>
				<input name="height" type="number" bind:value={preset.height} max="999" min="2" />
			</div>

			<div class="field-row">
				<label for="width">Width:</label>
				<input name="width" type="number" bind:value={preset.width} max="999" min="2" />
			</div>

			<div class="field-row">
				<label for="mineCount">Mines:</label>
				<input
					name="mineCount"
					type="number"
					bind:value={preset.mineCount}
					max={preset.width * preset.height - 1}
					min="1"
				/>
			</div>
		</div>
		<div class="actions">
			<Button type="submit" on:click={ok}>Ok</Button>
			<Button on:click={cancel}>Cancel</Button>
		</div>
	</form>

	<div class="presets">
		{#each Object.entries($presets$) as [key, data]}
			<Button on:click={() => (preset = data)}>Set to {key}</Button>
		{/each}
	</div>
</div>

<style lang="scss">
	.custom-settings {
		display: flex;
		gap: 16px;
		flex-direction: column;
		align-items: center;
		padding: 4px;

		form {
			display: flex;
			gap: 16px;
			flex-direction: row;

			.inputs {
				display: flex;

				flex-direction: column;

				.field-row {
					justify-content: space-between;
					input {
						width: 60px;
					}
				}
			}

			.actions {
				display: flex;
				gap: 16px;
				flex-direction: column;
				justify-content: center;
			}
		}

		.presets {
			display: flex;
			flex-direction: column;
			gap: 3px;
		}
	}
</style>
