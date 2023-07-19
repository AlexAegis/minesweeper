<script lang="ts">
	import { ButtonLook } from '../../desktop/components/button-look.enum';
	import Button from '../../desktop/components/button.svelte';
	import type { SmileyState } from '../store';

	export let smileyState: SmileyState;
</script>

<div class="ms-smiley {smileyState}">
	<Button on:click aria-label="Restart" look="{ButtonLook.THICK}" />
</div>

<style lang="scss">
	:global(.click).ms-smiley :global(button) {
		background-image: var(--asset-smiley-click);
	}

	:global(.lost).ms-smiley :global(button) {
		background-image: var(--asset-smiley-lost);
	}

	:global(.ongoing).ms-smiley :global(button) {
		background-image: var(--asset-smiley-ongoing);
	}

	:global(.won).ms-smiley :global(button) {
		background-image: var(--asset-smiley-won);
	}

	.ms-smiley {
		width: 25px;
		height: 25px;
		background-color: var(--tile-border-color);
		border-color: var(--tile-border-color);
		border-style: solid;
		border-width: 1px;

		--background-image-positon: 2px;

		:global(button) {
			padding: 2px 1px 1px 2px;

			// seamless color
			outline-offset: 0;
			outline: var(--tile-border-color) solid 1px !important;
			width: 100%;
			height: 100%;
		}
	}
</style>
