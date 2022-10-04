<script lang="ts">
	import { highscoreEntries$ } from '../store/game.store';
</script>

<div>
	<span class="title">Title</span>
	<span class="time">Time</span>
	<span class="description">Description</span>
</div>
<div class="highscore-entires">
	{#each $highscoreEntries$ as highscoreEntry}
		<span class="title">{highscoreEntry.title}</span>
		<span class="time">{highscoreEntry.timeStamp}</span>
		<span class="description">({highscoreEntry.description})</span>
	{:else}No games played yet!{/each}
</div>

<style>
	.highscore-entires {
		overflow-y: scroll;
	}

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
