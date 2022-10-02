<script lang="ts">
	import { version } from '../../package.json';
	import Menu from './components/menu.svelte';
	import Playfield from './components/playfield.svelte';
	import Smiley from './components/smiley.svelte';
	import { assetMap } from './consts/asset-urls.const';
	import { elapsedSeconds$, minesweeperActions, remainingMines$ } from './store/game.store';
	import DigitDisplay from './ui/digit-display.svelte';
	import Panel from './ui/panel.svelte';
	import TitleBar from './ui/title-bar.svelte';
</script>

<div class="panel outer outset">
	<TitleBar title="Svelte Minesweeper v{version}" icon={assetMap.mine} />
	<div class="panel game padded">
		<Menu />
		<Panel class="panel inset padded">
			<DigitDisplay value={$remainingMines$} paddedLength={3} />
			<Smiley on:click={() => minesweeperActions.resetGame.next()} />
			<DigitDisplay value={$elapsedSeconds$} paddedLength={3} />
		</Panel>
		<Playfield class="panel inset" />
	</div>
</div>

<style>
	.outer {
		display: grid;
		height: fit-content;
		width: fit-content;
		margin: auto;
		grid-template-rows: auto auto;
		user-select: none;
	}

	.game {
		display: grid;
		grid-auto-rows: 1fr;
		grid-auto-columns: 1fr;
		height: fit-content;
		width: fit-content;
		box-sizing: border-box;
		grid-template-rows: auto 5em auto;
	}
</style>
