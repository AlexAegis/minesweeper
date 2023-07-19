<script lang="ts">
	/** eslint-disable @typescript-eslint/no-confusing-void-expression */
	import { onDestroy, onMount } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import Panel from '../desktop/components/panel.svelte';
	import SegmentDisplayPanel from '../games/components/segment-display-panel.svelte';
	import Playfield from './components/playfield.svelte';
	import Smiley from './components/smiley.svelte';
	import type { MinesweeperGame } from './store';

	import './styles/minesweeper.scss';

	export let internals: MinesweeperGame;

	$: cheating$ = internals.cheating$;
	$: cheating = $cheating$;

	onMount(() => {
		internals.game$.unpause();
	});
	onDestroy(() => {
		internals.game$.pause();
	});
</script>

<div class="game">
	<Panel class="game panel inset padded">
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
		dicedTiles="{internals.dicedTiles}"
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
		display: flex;
		flex-direction: column;
		padding: var(--game-area-padding);
		border-width: var(--game-area-border-width);
		border-color: var(--border-color-light-og);
		border-style: outset;

		// These borders are not present on the XP version
	}
</style>
