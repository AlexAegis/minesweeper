<script lang="ts">
	import { getGameTileState, type TileInstance } from '../store/game.store';

	import { createEventDispatcher } from 'svelte';
	import { assetMap } from '../consts/asset-urls.const';
	import { colorMap } from '../consts/colors.const';
	import { FieldMark } from '../core/field-mark.enum';

	import { Observable, Subscription } from 'rxjs';
	import { onDestroy } from 'svelte';
	import Button from './button.svelte';
	import Image from './image.svelte';

	const dispatch = createEventDispatcher();

	export let x: number;
	export let y: number;

	$: {
		console.log('resub!', x, y, tile);
		let tile$ = getGameTileState(x, y);
	}

	let sink = new Subscription();
	let tile$: Observable<TileInstance>;
	let tile: TileInstance = $tile$;
	console.log('tile!', x, y, tile);

	export let disabled: boolean = false;
	export let neighbourPressed: boolean = false;

	function mouseup() {
		dispatch('mouseup', {
			x,
			y,
		});
	}

	function mousedown() {
		dispatch('mousedown', {
			x,
			y,
		});
	}

	function contextmenu() {
		dispatch('contextmenu', {
			x,
			y,
		});
	}

	onDestroy(sink.unsubscribe);
</script>

{#if tile.revealed}
	<div
		class="ms-tile"
		class:fontpatch={!tile.isMine && tile.value && !tile.error}
		class:ms-tile-error={tile.error && tile.isMine}
		on:click={mouseup}
		on:contextmenu={contextmenu}
		on:mousedown={mousedown}
		style="color: {colorMap[tile.value]}; grid-row: {x + 1}; grid-column: {y + 1};"
	>
		{#if tile.isMine}
			<Image class="tile-img" src={assetMap.mine} alt="Mine" />
		{:else if tile.error}
			<Image class="tile-img" src={assetMap.mineFalse} alt="False mine" />
		{:else if tile.value}{tile.value}{/if}
	</div>
{:else}
	<Button
		mousedown={neighbourPressed && tile.mark === FieldMark.EMTPY}
		{disabled}
		on:mousedown={mousedown}
		class="button ms-tile ms-tile-font{tile.error ? ' ms-tile-error' : ''}"
		style="grid-row: {x + 1}; grid-column: {y + 1};"
		aria-label="Tile {tile.mark !== FieldMark.EMTPY ? 'mark' : 'unrevealed'}"
		on:click={mouseup}
		on:contextmenu={contextmenu}
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
