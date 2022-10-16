<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import type { MinesweeperGame } from '../store';
	import Panel from '../ui/panel.svelte';
	import SegmentDisplayPanel from '../ui/segment-display-panel.svelte';
	import Playfield from './playfield.svelte';
	import Smiley from './smiley.svelte';

	export let internals: MinesweeperGame;

	$: cheating$ = internals.cheating$;
	$: cheating = $cheating$;

	onMount(() => internals.game$.unpause());
	onDestroy(() => internals.game$.pause());
</script>

<div class="game">
	<Panel class="game panel inset padded">
		<Observer observable={internals.remainingMines$} let:next>
			<SegmentDisplayPanel value={next} paddedLength={3} />
		</Observer>
		<Observer observable={internals.smileyState$} let:next>
			<Smiley
				on:click={() => internals.minesweeperActions.resetGame.next()}
				smileyState={next}
			/>
		</Observer>
		<Observer observable={internals.elapsedSeconds$} let:next>
			<SegmentDisplayPanel value={next} paddedLength={3} />
		</Observer>
	</Panel>

	<Playfield
		class="panel inset"
		dicedTiles={internals.dicedTiles}
		{cheating}
		on:leftclickDown={(event) =>
			internals.minesweeperActions.clickActions.leftclickDown.next(event.detail)}
		on:leftclickUp={(event) =>
			internals.minesweeperActions.clickActions.leftclickUp.next(event.detail)}
		on:rightclickUp={(event) =>
			internals.minesweeperActions.clickActions.rightclickUp.next(event.detail)}
		on:mouseleave={(event) =>
			internals.minesweeperActions.clickActions.cancelClick.next(event.detail)}
	/>
</div>

<style lang="scss">
	.game {
		display: flex;
		flex-direction: column;
		padding: var(--game-area-padding);

		border-width: var(--game-area-border-width);
		border-color: var(--border-color-light-og);
		border-top-style: outset;
		border-left-style: outset;

		// These borders are not present on the XP version
		border-right-style: outset;
		border-bottom-style: outset;
	}
</style>
