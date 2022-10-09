<script lang="ts">
	import { assetMap } from '../consts/asset-urls.const';
	import { smileyState$ } from '../store/game.store';
	import { ButtonLook } from '../ui/button-type.enum';
	import Button from '../ui/button.svelte';
	import Image from '../ui/image.svelte';

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
