<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CoordinateLike } from '../core';
	import { isEmptyTileMark, isFlagTileMark, isQuestionTileMark } from '../core/tile-mark.enum';
	import type { TileState } from '../store';
	import { ButtonLook } from '../ui/button-look.enum';

	import Button from '../ui/button.svelte';

	const dispatch = createEventDispatcher();

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

	function getValueClass(tile: TileState): string {
		return `ms-tile-${tile.value}`;
	}

	function getTileClassList(tile: TileState): string {
		const classes: string[] = [];

		if (isQuestionTileMark(tile.mark)) {
			classes.push('question-mark');
		} else if (isFlagTileMark(tile.mark)) {
			classes.push('flag');
		} else if (cheating) {
			classes.push('debug');
		} else {
		}

		if (tile.revealed) {
			classes.push('revealed');
		}

		if (tile.guessedWrong) {
			classes.push('wrong');
		}

		// Protected styles to avoid information leaking
		if (isEmptyTileMark(tile.mark) && (tile.revealed || cheating)) {
			classes.push(getValueClass(tile));

			if (tile.isMine) {
				classes.push('mine');
			}
		}

		return classes.join(' ');
	}

	$: tileClass = getTileClassList(tile);
</script>

<Button
	class="ms-tile {tileClass}"
	pressed={(tile.revealed || tile.pressed) &&
		!(isFlagTileMark(tile.mark) || isQuestionTileMark(tile.mark))}
	disabled={tile.disabled}
	appearDisabled={tile.revealed}
	selfPress={false}
	look={ButtonLook.THICK_PRESSED_THIN}
	on:fire={fire}
	on:startFire={startFire}
	on:alternativeFire={alternativeFire}
	on:cancelFire={cancelFire}
	style="grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
/>

<style lang="scss">
</style>
