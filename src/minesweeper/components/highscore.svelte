<script lang="ts">
	import { highscoreEntries$ } from '../store';
</script>

<div class="header column-layout">
	<span class="title">Title</span>
	<span class="time">Time</span>
	<span class="description">Description</span>
</div>
<div class="highscore">
	<div class="column-layout">
		{#each $highscoreEntries$ as highscoreEntry}
			<span class="title">{highscoreEntry.title}</span>
			<span class="time">{highscoreEntry.timeStamp}</span>
			<span class="description">({highscoreEntry.description})</span>
		{:else}No games played yet!{/each}
	</div>
</div>

<style lang="scss">
	.header {
		margin-right: 16px;
	}

	.highscore {
		overflow-y: scroll;
	}

	.column-layout {
		margin-top: 1em;
		display: grid;
		grid-template-columns: 4em 3em auto;
		gap: 0.5em;
	}

	.description {
		color: grey;
		margin-left: auto;
	}
</style>
