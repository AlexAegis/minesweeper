<script lang="ts">
	import type { Observable } from 'rxjs';
	import type { HighscoreEntry } from '../store';

	export let highscoreEntries$: Observable<HighscoreEntry[]>;
</script>

<div class="content">
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
</div>

<style lang="scss">
	.content {
		margin: 16px 0 0 16px;
		height: calc(100% - 16px);

		.header {
			margin-right: 16px;
		}

		.highscore {
			overflow-y: scroll;
			height: inherit;
		}

		.column-layout {
			display: grid;
			grid-template-columns: 4em 3em auto;
			gap: 0.5em;
		}

		.description {
			color: grey;
			margin-left: auto;
			margin-right: 16px;
		}
	}
</style>
