<script lang="ts">
	import { gamestate$, isTileMouseDown$ } from '../store';
	import Button from './button.svelte';

	$: smiley = $isTileMouseDown$ ? 'click' : $gamestate$;
</script>

<style>
	img {
		image-rendering: pixelated;
		width: 100%;
		height: 100%;
	}
</style>

<Button on:click aria-label="Restart" class="button padded" style="width: 60px; height: 60px;">
	<img
		aria-label={smiley}
		alt="{smiley} game"
		src="./assets/minesweeper/smiley-{smiley}-small.png" />
</Button>
