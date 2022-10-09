<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import {
		gameHeightArray$,
		gameWidthArray$,
		getGameTileState,
		minesweeperActions,
	} from '../store';
	import { debug$ } from '../store/root.store';
	import Tile from './tile.svelte';
</script>

<div class="playfield {$$props.class}" style={$$props.style}>
	{#each $gameHeightArray$ as y}
		{#each $gameWidthArray$ as x}
			<Observer observable={getGameTileState(x, y)} let:next>
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
			</Observer>
		{/each}
	{/each}
</div>

<style lang="scss">
	.playfield {
		display: grid;
		width: fit-content;
		height: fit-content;
		margin: auto;

		background-color: #a6a6a6; // same as border color to avoid color bleed
	}
</style>
