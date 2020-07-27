<script lang="ts">
	import { gamestate$, isTileMouseDown$ } from './store';

	$: smiley = $isTileMouseDown$ ? 'click' : $gamestate$;
</script>

<style>
	img {
		image-rendering: pixelated;
		width: 100%;
		height: 100%;
	}

	button {
		width: 60px;
		height: 60px;
	}
</style>

<button on:click aria-label="Restart" class="button padded">
	<img
		aria-label={smiley}
		alt="{smiley} game"
		src="./assets/minesweeper/smiley-{smiley}-small.png" />
</button>
