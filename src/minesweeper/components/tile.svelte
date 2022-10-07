<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { assetMap } from '../consts/asset-urls.const';
	import { colorMap } from '../consts/colors.const';
	import type { CoordinateLike } from '../core';
	import { isEmptyTileMark, isFlagTileMark, isQuestionTileMark } from '../core/tile-mark.enum';
	import type { TileState } from '../store/game.store';
	import { ButtonType } from '../ui/button-type.enum';

	import Button from '../ui/button.svelte';
	import Image from '../ui/image.svelte';

	const dispatch = createEventDispatcher();

	export let tile: TileState;

	export let debug = false;

	let pressed = false;

	function asCoordinate(tile: TileState): CoordinateLike {
		return { x: tile.x, y: tile.y };
	}

	function pointerdown(event: PointerEvent) {
		event.preventDefault();
		const coord = asCoordinate(tile);
		if (event.button === 0) {
			dispatch('leftclickDown', coord);
		} else if (event.button === 1) {
			dispatch('middleclickDown', coord);
		} else if (event.button === 2) {
			dispatch('rightclickDown', coord);
		}
		pressed = true;
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
</script>

{#if tile.revealed}
	<div
		class="ms-tile ms-tile-font"
		class:ms-fontpatch-div={!tile.isMine && !tile.guessedWrong}
		class:ms-tile-error={tile.guessedWrong && tile.isMine}
		on:pointerdown={pointerdown}
		on:click={click}
		on:contextmenu={contextmenu}
		on:mouseleave={mouseleave}
		style="color: {colorMap[tile.value]}; grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
	>
		{#if tile.isMine}
			<Image class="ms-div-tile-img" src={assetMap.mine} alt="Mine" />
		{:else if tile.guessedWrong}
			<Image class="ms-div-tile-img" src={assetMap.mineFalse} alt="False mine" />
		{:else if tile.value}{tile.value}{/if}
	</div>
{:else}
	<Button
		class="button ms-tile ms-tile-font ms-fontpatch-button{tile.guessedWrong
			? ' ms-tile-error'
			: ''}"
		mousedown={tile.pressed && isEmptyTileMark(tile.mark)}
		disabled={tile.disabled}
		disableSelfInset={true}
		type={ButtonType.THICK_PRESSED_THIN}
		on:pointerdown={pointerdown}
		on:click={click}
		on:contextmenu={contextmenu}
		on:mouseleave={mouseleave}
		style="grid-row: {tile.y + 1}; grid-column: {tile.x + 1};"
		aria-label="Tile {isEmptyTileMark(tile.mark) ? 'unrevealed' : 'mark'}"
	>
		{#if isFlagTileMark(tile.mark)}
			<Image class="ms-button-tile-img" src={assetMap.flag} alt="Flag" />
		{:else if isQuestionTileMark(tile.mark)}
			<Image class="ms-button-tile-img" src={assetMap.questionMark} alt="Question mark" />
		{:else if debug}
			{tile.isMine ? '×' : tile.value}
		{/if}
	</Button>
{/if}

<style>
	:global(.ms-tile) {
		height: 40px;
		width: 40px;
		display: block;
		box-sizing: border-box;
	}

	:global(.ms-tile-font) {
		font-family: 'Press Start 2P', 'Pixelate', Tahoma, Geneva, Verdana, sans-serif !important;
		font-size: 32px;
		text-align: center;
		padding: 0;
	}

	:global(.ms-tile-error) {
		background-color: red;
	}

	div {
		user-select: none;
		border-style: solid;
		border-color: #a6a6a6;
		border-width: 1px;
		text-align: center;
		font-size: 32px;
		line-height: 42px;
	}

	:global(.ms-fontpatch-div) {
		padding-left: 4px;
	}

	:global(.ms-fontpatch-button) {
		padding-top: 3px;
		padding-left: 2px;
		color: #a6a6a6;
	}

	:global(.ms-button-tile-img) {
		margin-top: -4px;
		margin-left: -3px;
	}

	:global(.ms-div-tile-img) {
		margin-top: -1px;
		margin-left: -0.5px;
	}
</style>
