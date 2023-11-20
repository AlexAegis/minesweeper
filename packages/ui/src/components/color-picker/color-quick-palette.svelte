<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../button.svelte';
	import { COMMON_COLORS, type ColorRgb } from './color-picker.interface';
	import ColorSelectButton from './color-select-button.svelte';

	// TODO: pass it in
	export let customColor: ColorRgb | undefined = undefined;
	const dispatch = createEventDispatcher<{
		select: ColorRgb;
	}>();
</script>

<div class="quick-color-palette">
	{#each Object.values(COMMON_COLORS) as color}
		<ColorSelectButton {color} on:select="{(event) => dispatch('select', event.detail)}"
		></ColorSelectButton>
	{/each}
	<!-- And 4 more from current theme-->
	<!-- <ColorSelectButton {3DObjectColor}></ColorSelectButton> -->
	<!-- <ColorSelectButton {applicationBackgroundColor}></ColorSelectButton> -->
	<!-- <ColorSelectButton {3DObjectLighterColor}></ColorSelectButton> -->
	<!-- <ColorSelectButton {unknown gray 160 160 164 mostly}></ColorSelectButton> -->
</div>
<hr />
<Button>Other...</Button>
{#if customColor}
	<ColorSelectButton
		color="{customColor}"
		on:select="{(event) => dispatch('select', event.detail)}"
	></ColorSelectButton>
{/if}

<style>
	.quick-color-palette {
		display: grid;
		grid-template-columns: repeat(4, 21px);
		grid-template-rows: repeat(5, 21px);
		padding: 2px;
		gap: 2px;
		box-sizing: border-box;
	}
</style>
