<script>
	import Score from './score.svelte';
	import Playfield from './playfield.svelte';
</script>

<style>
	div {
		background-color: #aaa;
		height: 100%;
		display: grid;
		grid-template-rows: 5em auto;
	}

	div :global(.pf) {
		margin: auto;
	}
</style>

<div>
	<h1>MineSweeper</h1>
	<Playfield class="pf" height={10} width={12} />
</div>
