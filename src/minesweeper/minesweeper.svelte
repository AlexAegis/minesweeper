<script lang="ts">
	import { displayName, version } from '../../package.json';
	import Menu from './components/menu.svelte';
	import Playfield from './components/playfield.svelte';
	import Smiley from './components/smiley.svelte';
	import { assetMap } from './consts/asset-urls.const';
	import { elapsedSeconds$, minesweeperActions, remainingMines$ } from './store/game.store';
	import DigitDisplay from './ui/digit-display.svelte';
	import Panel from './ui/panel.svelte';
	import Window from './ui/window.svelte';
</script>

<Window
	title="{displayName} v{version}"
	icon={assetMap.mine}
	tight={true}
	resizable={true}
	class="minesweeper"
>
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
	.game {
		display: flex;
		flex-direction: column;
		padding: 3px;
	}
</style>
