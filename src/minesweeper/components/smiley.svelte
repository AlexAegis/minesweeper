<script lang="ts">
	import { smileyState$ } from '../store/game.store';
	import { ButtonLook } from '../ui/button-look.enum';
	import Button from '../ui/button.svelte';
	import Image from '../ui/image.svelte';

	export const assetMap = {
		clickSmiley: './assets/minesweeper/smiley-click-small.png',
		lostSmiley: './assets/minesweeper/smiley-lost-small.png',
		ongoingSmiley: './assets/minesweeper/smiley-ongoing-small.png',
		wonSmiley: './assets/minesweeper/smiley-won-small.png',
	};

	$: src = assetMap[$smileyState$];
</script>

<div class="ms-smiley">
	<Button on:click aria-label="Restart" look={ButtonLook.THICK} class="ms-smiley">
		<Image style="width: 100%; height: 100%;" alt={src} bind:src />
	</Button>
</div>

<style lang="scss">
	.ms-smiley {
		width: 26px;
		height: 26px;

		background-color: var(--tile-border-color);

		border-color: var(--tile-border-color);
		border-style: solid;
		border-width: 1px;

		:global(button) {
			padding: 2px 1px 1px 2px;

			width: 100%;
			height: 100%;

			// seamless color
			outline-color: var(--tile-border-color);
			outline-style: solid;
			outline-width: 1px;
			outline-offset: 0px; // 98css sets this to -4px

			&.pressed {
				padding: 2px 1px 1px 2px;
			}
		}
	}
</style>
