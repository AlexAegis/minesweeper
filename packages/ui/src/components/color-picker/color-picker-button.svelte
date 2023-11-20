<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { w2kDropdownArrowSmall } from '../../assets/misc';
	import Button from '../button.svelte';
	import ContextMenu from '../context-menu.svelte';
	import Image from '../image.svelte';
	import { toCssRgb, type ColorRgb } from './color-picker.interface';
	import ColorQuickPalette from './color-quick-palette.svelte';

	export let disabled = false;
	export let color: ColorRgb | undefined = undefined;

	const dispatch = createEventDispatcher<{
		change: ColorRgb;
	}>();

	$: colorRgb = toCssRgb(color);
	/**
	 * The button does **not** stay pressed when the quick palette is open
	 */
	export let open = false;
	let button: HTMLElement | undefined;
</script>

<Button
	bind:button
	class="custom type-high color-picker {$$props['class'] ?? ''}"
	{disabled}
	on:click="{() => {
		open = !open;
	}}"
	style="

--selected-color: {colorRgb}; {$$props['style'] ?? ''}"
>
	<!--
		For some reason this doesn't work here
		style:--selected-color="{colorRgb}"
-->
	<div class="color-preview" class:enabled="{!disabled}"></div>
	<div class="vertical-separator"></div>
	<Image src="{w2kDropdownArrowSmall}" {disabled}></Image>
</Button>

{#if button && open}
	<ContextMenu
		class="color-picker"
		position="{button.getBoundingClientRect()}"
		spawnElement="{button}"
		xAxisAnimated="{false}"
		yAxisAnimated="{false}"
		on:dismiss="{() => {
			open = false;
		}}"
	>
		<ColorQuickPalette
			on:select="{(event) => {
				color = event.detail;
				dispatch('change', color);
			}}"
		></ColorQuickPalette>
	</ContextMenu>
{/if}

<style lang="scss">
	:global(button.color-picker) {
		gap: 1px !important;
		box-sizing: border-box;
		width: calc(42px - 1px) !important;
		height: 21px !important;
		padding-left: 4px !important;
		padding-right: 1px !important;
		margin-left: 2px;
		margin-right: 2px;
	}

	:global(div.context-menu.color-picker) {
		min-width: 0 !important;
	}

	.vertical-separator {
		height: 13px;
		margin-right: 0 !important;
		margin-left: 2px !important;
	}

	.color-preview {
		width: 22px;
		height: 13px;
		box-sizing: border-box;

		&.enabled {
			border: 1px solid black;
			background-color: var(--selected-color);
		}
	}
</style>
