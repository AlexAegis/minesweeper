<script lang="ts">
	import { assetMap } from '../consts/asset-urls.const';
	import { smileyState$ } from '../store/game.store';
	import { ButtonType } from '../ui/button-type.enum';
	import Button from '../ui/button.svelte';
	import Image from '../ui/image.svelte';

	$: src = assetMap[$smileyState$];
</script>

<Button
	on:click
	aria-label="Restart"
	type={ButtonType.THICK}
	class="ms-smiley padded"
	style="width: 60px; height: 60px;"
>
	<Image style="width: 100%; height: 100%;" alt={src} bind:src />
</Button>

<style>
</style>
