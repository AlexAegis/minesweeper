<script lang="ts">
	import type { Observable } from 'rxjs';
	import { createEventDispatcher } from 'svelte';

	import { Button } from '@w2k/ui';
	import type { GamePreset } from '../interfaces';
	const dispatch = createEventDispatcher();

	export let presets$: Observable<Record<string, GamePreset>>;
	export let preset: GamePreset;

	const calculateMaxMines = (preset: Pick<GamePreset, 'height' | 'width'>): number => {
		return preset.width * preset.height - 1;
	};

	function enforceValidPreset(preset: GamePreset) {
		if (preset.height > 50) {
			preset.height = 50;
		}

		if (preset.height < 1) {
			preset.height = 1;
		}

		if (preset.width > 50) {
			preset.width = 50;
		}

		if (preset.width < 1) {
			preset.width = 1;
		}

		const maxMines = calculateMaxMines(preset);
		if (preset.mineCount > maxMines) {
			preset.mineCount = maxMines;
		}

		if (preset.mineCount < 1) {
			preset.mineCount = 1;
		}
	}

	function submit() {
		enforceValidPreset(preset);
		dispatch('submit', preset);
	}

	function cancel() {
		dispatch('cancel');
	}

	$: {
		enforceValidPreset(preset);
	}
</script>

<div class="custom-settings">
	<form on:submit|preventDefault="{submit}">
		<div class="inputs">
			<div class="field-row">
				<label for="height">Height:</label>
				<input
					name="height"
					type="number"
					inputmode="numeric"
					bind:value="{preset.height}"
					max="50"
					min="1"
				/>
			</div>

			<div class="field-row">
				<label for="width">Width:</label>
				<input
					name="width"
					type="number"
					inputmode="numeric"
					bind:value="{preset.width}"
					max="50"
					min="1"
				/>
			</div>

			<div class="field-row">
				<label for="mineCount">Mines:</label>
				<input
					name="mineCount"
					type="number"
					inputmode="numeric"
					bind:value="{preset.mineCount}"
					max="{calculateMaxMines(preset)}"
					min="1"
				/>
			</div>
		</div>
		<div class="actions">
			<Button type="submit">OK</Button>
			<Button on:click="{cancel}">Cancel</Button>
		</div>
	</form>

	<div class="presets">
		{#each Object.entries($presets$) as [key, data]}
			<Button on:click="{() => (preset = data)}">Set to {key}</Button>
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
