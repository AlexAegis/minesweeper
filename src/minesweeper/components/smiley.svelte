<script lang="ts">
	import { assetMap } from '../consts/asset-urls.const';
	import { smileyState$ } from '../store/game.store';
	import { ButtonType } from '../ui/button-type.enum';
	import Button from '../ui/button.svelte';
	import Image from '../ui/image.svelte';

	$: src = assetMap[$smileyState$];
</script>

<Button on:click aria-label="Restart" type={ButtonType.THICK} class="ms-smiley">
	<Image style="width: 100%; height: 100%;" alt={src} bind:src />
</Button>

<style lang="scss">
	:global(.ms-smiley) {
		width: 31px;
		height: 31px;

		padding: 2px 1px 1px 2px;

		&.pressed {
			padding: 2px 1px 1px 2px;
		}
	}
</style>
