<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { assetMap } from '../consts/asset-urls.const';
	import { colorMap } from '../consts/colors.const';
	import { FieldMark } from '../core/field-mark.enum';
	import type { TileInstance } from '../store/game.store';

	import Button from '../ui/button.svelte';
	import Image from '../ui/image.svelte';

	const dispatch = createEventDispatcher();

	export let tile: TileInstance;

	function mouseup(_event: Event) {
		dispatch('leftclickUp', tile);
	}

	function mousedown(_event: Event) {
		dispatch('leftclickDown', tile);
	}

	function contextmenu(event: Event) {
		event.preventDefault();
		dispatch('rightclickUp', tile);
	}
</script>

{#if tile.revealed}
	<div
		class="ms-tile"
		class:fontpatch={!tile.isMine && tile.value && !tile.guessedWrong}
		class:ms-tile-error={tile.guessedWrong && tile.isMine}
		on:click={mouseup}
		on:pointerdown={mousedown}
		on:contextmenu={contextmenu}
		style="color: {colorMap[tile.value]}; grid-row: {tile.x + 1}; grid-column: {tile.y + 1};"
	>
		{#if tile.isMine}
			<Image class="tile-img" src={assetMap.mine} alt="Mine" />
		{:else if tile.guessedWrong}
			<Image class="tile-img" src={assetMap.mineFalse} alt="False mine" />
		{:else if tile.value}{tile.value}{/if}
	</div>
{:else}
	<Button
		mousedown={tile.pressed && tile.mark === FieldMark.EMTPY}
		disabled={tile.disabled}
		disableSelfInset={true}
		on:click={mouseup}
		on:pointerdown={mousedown}
		on:contextmenu={contextmenu}
		class="button ms-tile ms-tile-font{tile.guessedWrong ? ' ms-tile-error' : ''}"
		style="grid-row: {tile.x + 1}; grid-column: {tile.y + 1};"
		aria-label="Tile {tile.mark !== FieldMark.EMTPY ? 'mark' : 'unrevealed'}"
	>
		{#if tile.mark === FieldMark.FLAG}
			<Image class="tile-img" src={assetMap.flag} alt="Flag" />
		{:else if tile.mark === FieldMark.QUESTION}
			<Image class="tile-img" src={assetMap.questionMark} alt="Question mark" />
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
		font-size: 32px;
		text-align: center;
		padding: 0;
	}

	:global(.ms-tile-error) {
		background-color: red;
	}

	div {
		user-select: none;
		font-family: 'Press Start 2P', cursive;
		border-style: solid;
		border-color: #a6a6a6;
		border-width: 1px;
		text-align: center;
		font-size: 32px;
		line-height: 42px;
	}

	.fontpatch {
		padding-left: 4px;
	}

	:global(.tile-img) {
		margin-top: -1px;
		margin-left: -1px;
	}
</style>
