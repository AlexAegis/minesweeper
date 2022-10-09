<script lang="ts">
	import { smileyState$ } from '../store/game.store';
	import { ButtonLook } from '../ui/button-look.enum';
	import Button from '../ui/button.svelte';
</script>

<div class="ms-smiley {$smileyState$}">
	<Button on:click aria-label="Restart" look={ButtonLook.THICK_PRESSED_THIN} />
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

			width: 100%;
			height: 100%;

			// seamless color
			outline-offset: 0px;
			outline-color: var(--tile-border-color) !important;
			outline-width: 1px !important;
			outline-style: solid !important;

			width: 100%;
			height: 100%;

			&.pressed {
				background-position: 3px 3px;
			}
		}
	}
</style>
