<script lang="ts">
	import { Button } from '@w2k/ui';
	import type { Observable } from 'rxjs';
	import type { HighscoreEntry } from '../store';

	interface Props {
		highscoreEntries$: Observable<HighscoreEntry[]>;
		isClearingEnabled?: boolean;
		onClear?: (() => void) | undefined;
	}

	let { highscoreEntries$, isClearingEnabled = false, onClear = undefined }: Props = $props();
</script>

<div class="content">
	<div class="header column-layout">
		<span class="title">Title</span>
		<span class="time">Time</span>
		<span class="description">Description</span>
	</div>
	<div class="highscore">
		<div class="column-layout">
			{#each $highscoreEntries$ as highscoreEntry (highscoreEntry.timeStamp)}
				<span class="title">{highscoreEntry.title}</span>
				<span class="time">{highscoreEntry.timeStamp}</span>
				<span class="description">({highscoreEntry.description})</span>
			{:else}
				<span class="full-row">No games played yet!</span>
			{/each}
		</div>
	</div>
	<div class="footer">
		<Button disabled={!isClearingEnabled} onFire={() => onClear?.()}>Clear Highscrore</Button>
	</div>
</div>

<style lang="scss">
	.content {
		margin: 16px 0 0 16px;
		height: calc(100% - 16px);
		display: flex;
		flex-direction: column;

		.footer {
			margin-top: auto;
			padding-top: 2px;
			padding-right: 1px;
			padding-left: 1px;
			display: flex;
			flex-direction: row-reverse;
		}

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

			.full-row {
				grid-column: -1 / 1;
			}
		}

		.description {
			color: grey;
			margin-left: auto;
			margin-right: 16px;
		}
	}
</style>
