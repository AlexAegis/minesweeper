<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { isEmptyTileMark, isFlagTileMark, isQuestionTileMark } from '../interfaces';
	import type { TileState } from '../store';

	import { Button } from '@w2k/ui';

	interface Props {
		tile: TileState;
		cheating?: boolean;
		onStartFire?: ((coordinate: CoordinateLike) => void) | undefined;
		onFire?: ((coordinate: CoordinateLike) => void) | undefined;
		onAlternativeFire?: ((coordinate: CoordinateLike) => void) | undefined;
		onCancelFire?: ((coordinate: CoordinateLike) => void) | undefined;
	}

	let {
		tile,
		cheating = false,
		onStartFire = undefined,
		onFire = undefined,
		onAlternativeFire = undefined,
		onCancelFire = undefined,
	}: Props = $props();

	function asCoordinate(tile: TileState): CoordinateLike {
		return { x: tile.x, y: tile.y };
	}

	function startFire() {
		onStartFire?.(asCoordinate(tile));
	}

	function cancelFire() {
		onCancelFire?.(asCoordinate(tile));
	}

	function fire() {
		onFire?.(asCoordinate(tile));
	}

	function alternativeFire() {
		onAlternativeFire?.(asCoordinate(tile));
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
			classes.push(`minesweeper-tile-${tile.value.toString()}`);

			if (tile.isMine) {
				classes.push('mine');
			}
		}

		return classes.join(' ');
	}

	let tileClass = $derived(getTileClassList(tile, cheating));
</script>

<Button
	class="minesweeper-tile custom {tileClass}"
	pressed={tile.pressed || tile.revealed}
	disabled={tile.disabled}
	appearDisabled={tile.revealed}
	selfPress={false}
	onFire={fire}
	onStartFire={startFire}
	onAlternativeFire={alternativeFire}
	onCancelFire={cancelFire}
	style="grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
/>
