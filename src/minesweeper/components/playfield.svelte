<script lang="ts">
	import {
		gameHeightArray$,
		gameWidthArray$,
		getGameTileState,
		minesweeperActions,
	} from '../store/game.store';
	import { debug$ } from '../store/root.store';
	import Subscribe from '../ui/observer.svelte';
	import Tile from './tile.svelte';
</script>

<div class={$$props.class} style={$$props.style}>
	{#each $gameHeightArray$ as y}
		{#each $gameWidthArray$ as x}
			<Subscribe observable={getGameTileState(x, y)} let:next>
				<Tile
					debug={$debug$}
					tile={next}
					on:leftclickDown={(event) =>
						minesweeperActions.clickActions.leftclickDown.next(event.detail)}
					on:leftclickUp={(event) =>
						minesweeperActions.clickActions.leftclickUp.next(event.detail)}
					on:rightclickUp={(event) =>
						minesweeperActions.clickActions.rightclickUp.next(event.detail)}
					on:mouseleave={(event) =>
						minesweeperActions.clickActions.cancelClick.next(event.detail)}
				/>
			</Subscribe>
		{/each}
	{/each}
</div>

<style>
	div {
		display: grid;
		width: fit-content;
		height: fit-content;
		margin: auto;
	}
</style>
