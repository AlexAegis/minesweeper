<script lang="ts">
	import { assetMap } from '../consts/asset-urls.const';
	import { smileyState$ } from '../store/game.store';
	import Button from './button.svelte';
	import Image from './image.svelte';

	$: src = assetMap[$smileyState$];
</script>

<Button on:click aria-label="Restart" class="button padded" style="width: 60px; height: 60px;">
	<Image style="width: 100%; height: 100%;" alt={src} bind:src />
</Button>
