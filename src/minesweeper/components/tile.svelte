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

	let pressed = false;

	function asCoordinate(tile: TileState): CoordinateLike {
		return { x: tile.x, y: tile.y };
	}

	function pointerdown(event: PointerEvent) {
		event.preventDefault();
		const coord = asCoordinate(tile);
		if (event.button === 0 || (event.button === 1 && tile.revealed)) {
			dispatch('leftclickDown', coord);
		} else if (event.button === 2) {
			dispatch('rightclickDown', coord);
		}
		pressed = true;
	}

	function pointerup(event: PointerEvent) {
		event.preventDefault();
		const coord = asCoordinate(tile);
		if (event.button === 1 && tile.revealed) {
			dispatch('leftclickUp', coord);
		}
		pressed = false;
	}

	function mouseleave(_event: Event) {
		if (pressed) {
			const coord = asCoordinate(tile);
			dispatch('mouseleave', coord);
			pressed = false;
		}
	}

	function click(event: Event) {
		event.preventDefault();
		const coord = asCoordinate(tile);
		dispatch('leftclickUp', coord);
		pressed = false;
	}

	function contextmenu(event: Event) {
		event.preventDefault();
		const coord = asCoordinate(tile);
		dispatch('rightclickUp', coord);
		pressed = false;
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

{#if tile.revealed}
	<div
		class="ms-tile {tileClass}"
		on:click={click}
		on:pointerdown|preventDefault={pointerdown}
		on:pointerup|preventDefault={pointerup}
		on:contextmenu|preventDefault={contextmenu}
		on:mouseleave|preventDefault={mouseleave}
		style="grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
		aria-label={tile.value.toString()}
	/>
{:else}
	<Button
		class="ms-tile {tileClass}"
		mousedown={tile.pressed && isEmptyTileMark(tile.mark)}
		disabled={tile.disabled}
		disableSelfInset={true}
		look={ButtonLook.THICK_PRESSED_THIN}
		on:click={click}
		on:pointerdown={pointerdown}
		on:pointerup={pointerup}
		on:contextmenu={contextmenu}
		on:pointerout={mouseleave}
		on:tapleave={mouseleave}
		style="grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
		aria-label="Tile {isEmptyTileMark(tile.mark) ? 'unrevealed' : 'mark'}"
	/>
{/if}

<style lang="scss">
</style>
