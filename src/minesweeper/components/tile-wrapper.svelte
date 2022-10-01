<script lang="ts">
	import { getGameTileState, minesweeperActions } from '../store/game.store';

	import Tile from './tile.svelte';

	export let x: number;
	export let y: number;
	const tile$ = getGameTileState(x, y);
</script>

<Tile
	tile={$tile$}
	on:leftclickDown={(event) => minesweeperActions.leftclickDown.next(event.detail)}
	on:leftclickUp={(event) => minesweeperActions.leftclickUp.next(event.detail)}
	on:rightclickUp={(event) => minesweeperActions.rightclickUp.next(event.detail)}
/>
