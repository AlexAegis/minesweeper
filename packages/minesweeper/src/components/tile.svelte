<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { createEventDispatcher } from 'svelte';
	import { isEmptyTileMark, isFlagTileMark, isQuestionTileMark } from '../interfaces';
	import type { TileState } from '../store';

	import { Button } from '@w2k/ui';

	const dispatch = createEventDispatcher<{
		startFire: CoordinateLike;
		cancelFire: CoordinateLike;
		fire: CoordinateLike;
		alternativeFire: CoordinateLike;
	}>();

	export let tile: TileState;

	export let cheating = false;

	function asCoordinate(tile: TileState): CoordinateLike {
		return { x: tile.x, y: tile.y };
	}

	function startFire() {
		dispatch('startFire', asCoordinate(tile));
	}

	function cancelFire() {
		dispatch('cancelFire', asCoordinate(tile));
	}

	function fire() {
		dispatch('fire', asCoordinate(tile));
	}

	function alternativeFire() {
		dispatch('alternativeFire', asCoordinate(tile));
	}

	function getTileClassList(tile: TileState, cheating: boolean): string {
		const classes: string[] = [];

		if (isQuestionTileMark(tile.mark)) {
			classes.push('question-mark');
		} else if (isFlagTileMark(tile.mark)) {
			classes.push('flag');
		} else if (cheating) {
			classes.push('debug');
		}

		if (tile.revealed) {
			classes.push('revealed');
		}

		if (tile.guessedWrong) {
			classes.push('wrong');
		}

		// Protected styles to avoid information leaking
		if (isEmptyTileMark(tile.mark) && (tile.revealed || cheating)) {
			classes.push(`minesweeper-tile-${tile.value}`);

			if (tile.isMine) {
				classes.push('mine');
			}
		}

		return classes.join(' ');
	}

	$: tileClass = getTileClassList(tile, cheating);
</script>

<Button
	class="minesweeper-tile custom {tileClass}"
	pressed="{tile.pressed || tile.revealed}"
	disabled="{tile.disabled}"
	appearDisabled="{tile.revealed}"
	selfPress="{false}"
	on:fire="{fire}"
	on:startFire="{startFire}"
	on:alternativeFire="{alternativeFire}"
	on:cancelFire="{cancelFire}"
	style="grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
/>
