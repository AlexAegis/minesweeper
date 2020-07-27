<script lang="ts">
	import { gamestate$, isTileMouseDown$ } from './store';

	$: smiley = $isTileMouseDown$ ? 'click' : $gamestate$;
</script>

<style>
	button {
		width: 60px;
		height: 60px;
		border: #eee;
		border-style: outset;
		outline-color: #c3c3c3;
		outline-style: outset;
		border-spacing: 3px;
		border-width: 3px;
		padding: 3px;
		background-color: rgb(192, 192, 192);
	}
	img {
		image-rendering: pixelated;
		width: 100%;
		height: 100%;
	}
</style>

<button on:click aria-label="Restart">
	<img
		aria-label={smiley}
		alt="{smiley} game"
		src="./assets/minesweeper/smiley-{smiley}-small.png" />
</button>
