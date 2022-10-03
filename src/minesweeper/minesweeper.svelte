<script lang="ts">
	import { version } from '../../package.json';
	import Menu from './components/menu.svelte';
	import Playfield from './components/playfield.svelte';
	import Smiley from './components/smiley.svelte';
	import { assetMap } from './consts/asset-urls.const';
	import { elapsedSeconds$, minesweeperActions, remainingMines$ } from './store/game.store';
	import DigitDisplay from './ui/digit-display.svelte';
	import Panel from './ui/panel.svelte';
	import Window from './ui/window.svelte';
</script>

<Window title="Svelte Minesweeper v{version}" icon={assetMap.mine} class="minesweeper" tight={true}>
	<Menu />
	<div class="game panel outset">
		<Panel class="game panel inset padded">
			<DigitDisplay value={$remainingMines$} paddedLength={3} />
			<Smiley on:click={() => minesweeperActions.resetGame.next()} />
			<DigitDisplay value={$elapsedSeconds$} paddedLength={3} />
		</Panel>
		<Playfield class="panel inset" />
	</div>
</Window>

<style>
	:global(.minesweeper) {
		margin: auto; /* center window */
	}

	.game {
		display: flex;
		flex-direction: column;
		padding: 3px;
	}
</style>
