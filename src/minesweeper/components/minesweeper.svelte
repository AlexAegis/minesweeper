<script lang="ts">
	import Menu from './menu.svelte';
	import Playfield from './playfield.svelte';
	import Smiley from './smiley.svelte';

	import { elapsedSeconds$, minesweeperActions, remainingMines$ } from '../store';
	import Panel from '../ui/panel.svelte';
	import SegmentDisplayPanel from '../ui/segment-display-panel.svelte';
	import type { WindowState } from '../ui/window-state.interface';
	import Window from '../ui/window.svelte';

	export let windowState: WindowState;
</script>

<Window {windowState} class="minesweeper">
	<Menu />
	<div class="game">
		<Panel class="game panel inset padded">
			<SegmentDisplayPanel value={$remainingMines$} paddedLength={3} />
			<Smiley on:click={() => minesweeperActions.resetGame.next()} />
			<SegmentDisplayPanel value={$elapsedSeconds$} paddedLength={3} />
		</Panel>
		<Playfield class="panel inset" />
	</div>
</Window>

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
