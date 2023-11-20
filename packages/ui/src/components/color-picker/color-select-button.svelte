<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ColorRgb } from './color-picker.interface';

	export let color: ColorRgb;

	const dispatch = createEventDispatcher<{
		select: ColorRgb;
	}>();
</script>

<button class="custom" on:click="{() => dispatch('select', color)}">
	<div class="color" style="background-color: rgb({color.r} {color.g} {color.b});"></div>
</button>

<style lang="scss">
	button {
		&:not(:hover) {
			box-shadow:
				inset -1px -1px var(--win-3d-objects-color-lighter-2),
				inset 1px 1px var(--win-3d-objects-color-darker-1),
				inset -2px -2px var(--win-3d-objects-color),
				inset 2px 2px var(--win-shadow-color);
		}

		&:hover {
			border: 1px solid white;
			outline: 1px solid black;
			outline-offset: 0;
			padding: 0;
			box-shadow:
				inset -1px -1px black,
				inset 1px 1px black;
		}
	}

	.color {
		box-sizing: border-box;
		width: calc(17px + 0.24px); // Some shadow gap correction at high zoom levels
		height: calc(17px + 0.24px);
		margin: calc(1px - 0.12px);
		margin-right: 1px;
		margin-bottom: 1px;
	}
</style>
