<script lang="ts">
	import { assetMap, gamestate$, tileMouseDown$ } from '../store';
	import Button from './button.svelte';
	import Image from './image.svelte';

	$: smiley = $tileMouseDown$ ? 'click' : $gamestate$;
	$: src = assetMap[`${smiley ?? 'ongoing'}Smiley`];
</script>

<Button on:click aria-label="Restart" class="button padded" style="width: 60px; height: 60px;">
	<Image style="width: 100%; height: 100%;" alt="{smiley} game" bind:src />
</Button>
