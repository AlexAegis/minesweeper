<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { minesweeperActions, type MinesweeperGame } from '../store';
	import Panel from '../ui/panel.svelte';
	import SegmentDisplayPanel from '../ui/segment-display-panel.svelte';
	import Menu from './menu.svelte';
	import Playfield from './playfield.svelte';
	import Smiley from './smiley.svelte';

	export let internals: MinesweeperGame;
</script>

<Menu
	gameSettings$={internals.gameSettings$}
	isGameSettingsAPreset$={internals.isGameSettingsAPreset$}
	isGameSettingsNotAPreset$={internals.isGameSettingsNotAPreset$}
	highscoreEntries$={internals.highscoreEntries$}
	presets$={internals.presets$}
/>
<div class="game">
	<Panel class="game panel inset padded">
		<Observer observable={internals.remainingMines$} let:next>
			<SegmentDisplayPanel value={next} paddedLength={3} />
		</Observer>
		<Observer observable={internals.smileyState$} let:next>
			<Smiley on:click={() => minesweeperActions.resetGame.next()} smileyState={next} />
		</Observer>
		<Observer observable={internals.elapsedSeconds$} let:next>
			<SegmentDisplayPanel value={next} paddedLength={3} />
		</Observer>
	</Panel>

	<Playfield
		class="panel inset"
		gameHeightArray$={internals.gameHeightArray$}
		gameWidthArray$={internals.gameWidthArray$}
		getGameTileState={internals.getGameTileState}
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
