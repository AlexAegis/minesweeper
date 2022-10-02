<script lang="ts">
	import { highscoreEntries$ } from '../store/game.store';
</script>

<div>
	{#each $highscoreEntries$ as highscoreEntry}
		<span class="title">{highscoreEntry.title}</span>
		<span class="time">{highscoreEntry.time}</span>
		<span class="description">({highscoreEntry.description})</span>
	{:else}No games played yet!{/each}
</div>

<style>
	.description {
		color: grey;
		margin-left: auto;
	}

	div {
		margin-top: 1em;
		display: grid;
		grid-template-columns: 4em 3em auto;
		gap: 0.5em;
	}
</style>
