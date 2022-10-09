<script lang="ts">
	import { displayName } from '../../package.json';
	import Menu from './components/menu.svelte';
	import Playfield from './components/playfield.svelte';
	import Smiley from './components/smiley.svelte';

	import { elapsedSeconds$, minesweeperActions, remainingMines$ } from './store/game.store';
	import Panel from './ui/panel.svelte';
	import SegmentDisplayPanel from './ui/segment-display-panel.svelte';
	import Window from './ui/window.svelte';
</script>

<Window
	title={displayName}
	icon="./assets/minesweeper/mine.png"
	tight={true}
	resizable={true}
	class="minesweeper"
>
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

		// the original does not have borders on the bottom and the right here
		border-right-style: outset;
		border-bottom-style: outset;
	}
</style>
