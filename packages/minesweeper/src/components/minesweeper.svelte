<script lang="ts">
	import { Panel } from '@w2k/ui';
	import { onDestroy, onMount } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import type { MinesweeperGame } from '../store';
	import Playfield from './playfield.svelte';
	import SegmentDisplayPanel from './segment-display-panel.svelte';
	import Smiley from './smiley.svelte';

	import '../../static/minesweeper.scss';

	export let internals: MinesweeperGame;
	$: unlockedScheme$ = internals.unlockedScheme$;

	$: cheating$ = internals.cheating$;
	$: cheating = $cheating$;
	$: tileSlice = internals.tilesSlice$;

	onMount(() => {
		internals.game$.unpause();
	});
	onDestroy(() => {
		internals.game$.pause();
	});
</script>

<div class="game w2k-scheme-classic" class:w2k-scheme-classic="{!$unlockedScheme$}">
	<Panel class="stats">
		<Observer observable="{internals.remainingMines$}" let:next>
			<SegmentDisplayPanel value="{next}" paddedLength="{3}" />
		</Observer>
		<Observer observable="{internals.smileyState$}" let:next>
			<Smiley
				on:click="{() => {
					internals.minesweeperActions.resetGame.next(undefined);
				}}"
				smileyState="{next}"
			/>
		</Observer>
		<Observer observable="{internals.elapsedSeconds$}" let:next>
			<SegmentDisplayPanel value="{next}" paddedLength="{3}" />
		</Observer>
	</Panel>

	<Playfield
		class="panel inset"
		{tileSlice}
		{cheating}
		on:startFire="{(event) =>
			internals.minesweeperActions.clickActions.startFire.next(event.detail)}"
		on:fire="{(event) => {
			internals.minesweeperActions.clickActions.fire.next(event.detail);
		}}"
		on:alternativeFire="{(event) => {
			internals.minesweeperActions.clickActions.alternativeFire.next(event.detail);
		}}"
		on:cancelFire="{(event) => {
			internals.minesweeperActions.clickActions.cancelFire.next(event.detail);
		}}"
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
