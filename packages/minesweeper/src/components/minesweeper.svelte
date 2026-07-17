<script lang="ts">
	import { Panel } from '@w2k/ui';
	import { onDestroy, onMount } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import type { MinesweeperGame, SmileyState } from '../store';
	import Playfield from './playfield.svelte';
	import SegmentDisplayPanel from './segment-display-panel.svelte';
	import Smiley from './smiley.svelte';

	import '../../static/minesweeper.scss';

	interface Props {
		internals: MinesweeperGame;
	}

	let { internals }: Props = $props();
	let unlockedScheme$ = $derived(internals.unlockedScheme$);

	let cheating$ = $derived(internals.cheating$);
	let cheating = $derived($cheating$);
	let tileSlice = $derived(internals.tilesSlice$);

	onMount(() => {
		internals.game$.unpause();
	});
	onDestroy(() => {
		internals.game$.pause();
	});
</script>

<div class="game w2k-scheme-classic" class:w2k-scheme-classic={!$unlockedScheme$}>
	<Panel class="stats">
		<Observer observable={internals.remainingMines$}>
			{#snippet children({ next }: { next: number })}
				<SegmentDisplayPanel value={next} paddedLength={3} />
			{/snippet}
		</Observer>
		<Observer observable={internals.smileyState$}>
			{#snippet children({ next }: { next: SmileyState })}
				<Smiley
					onclick={() => {
						internals.minesweeperActions.resetGame.next(undefined);
					}}
					smileyState={next}
				/>
			{/snippet}
		</Observer>
		<Observer observable={internals.elapsedSeconds$}>
			{#snippet children({ next }: { next: number })}
				<SegmentDisplayPanel value={next} paddedLength={3} />
			{/snippet}
		</Observer>
	</Panel>

	<Playfield
		class="panel inset"
		{tileSlice}
		{cheating}
		onStartFire={(coordinate) =>
			internals.minesweeperActions.clickActions.startFire.next(coordinate)}
		onFire={(coordinate) => {
			internals.minesweeperActions.clickActions.fire.next(coordinate);
		}}
		onAlternativeFire={(coordinate) => {
			internals.minesweeperActions.clickActions.alternativeFire.next(coordinate);
		}}
		onCancelFire={(coordinate) => {
			internals.minesweeperActions.clickActions.cancelFire.next(coordinate);
		}}
	/>
</div>

<style lang="scss">
	.game {
		background: var(--win-3d-objects-color);
		display: flex;
		align-items: center;
		gap: 6px;
		flex-direction: column;
		padding: calc(var(--game-area-border-width) + var(--game-area-padding))
			var(--game-area-padding) var(--game-area-padding)
			calc(var(--game-area-border-width) + var(--game-area-padding));
		box-shadow:
			inset 1.05px 1.05px var(--win-3d-objects-color-lighter-1),
			inset 2.05px 2.05px var(--win-3d-objects-color-lighter-1),
			inset 3.05px 3.05px var(--win-3d-objects-color-lighter-1) !important;

		// These borders are not present on the XP version
	}

	:global(.game .stats) {
		display: flex;
		padding: 6px;
		width: calc(100% - 1px);
		background: var(--win-3d-objects-color);
		box-shadow:
			inset -1.05px -1.05px var(--win-3d-objects-color-lighter-1),
			inset 1.05px 1.05px var(--win-3d-objects-color-darker-1),
			inset -2.05px -2.05px var(--win-3d-objects-color-lighter-1),
			inset 2.05px 2.05px var(--win-3d-objects-color-darker-1) !important;
	}
</style>
