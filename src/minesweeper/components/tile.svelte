<script lang="ts">
	import { assetMap, FieldMark, MinesweeperGame } from '../core';
	import { colorMap, tileClick$, tileMouseDown$, width$ } from '../store';
	import Button from './button.svelte';
	import Image from './image.svelte';

	export let x: number;
	export let y: number;
	let value: number;
	let revealed: boolean = false;
	let mark: FieldMark;
	let mine: boolean = false;
	let error: boolean = false;
	export let disabled: boolean = false;

	let onReveal: (e: Event) => void;
	let onMark: (e: Event) => void;

	let isANeighbourPressed = false;

	$: pressedTile = $tileMouseDown$;

	$: width = $width$;

	$: if (pressedTile !== undefined) {
		if (pressedTile[1]) {
			const [ox, oy] = MinesweeperGame.fromLinear(width, pressedTile[0]);
			isANeighbourPressed = MinesweeperGame.isNeighbour(x, y, ox, oy);
		}
	} else {
		isANeighbourPressed = false;
	}

	export function getX(): number {
		return x;
	}
	export function getY(): number {
		return y;
	}
	export function getValue(): number {
		return value;
	}
	export function isRevealed(): boolean {
		return revealed;
	}
	export function getMark(): FieldMark {
		return mark;
	}

	export function isMine(): boolean {
		return mine;
	}

	export function getError(): boolean {
		return error;
	}

	export function setValue(v: number): void {
		value = v;
	}

	export function setRevealed(r: boolean): void {
		revealed = r;
	}

	export function setMark(m: FieldMark): void {
		mark = m;
	}

	export function setMine(m: boolean): void {
		mine = m;
	}

	export function setError(e: boolean): void {
		error = e;
	}

	export function registerOnReveal(callback: () => void): void {
		onReveal = (e: Event) => {
			e.preventDefault();
			callback();
		};
	}

	export function registerOnMark(callback: () => void): void {
		onMark = (e: Event) => {
			e.preventDefault();
			callback();
		};
	}
</script>

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

{#if revealed}
	<div
		class="ms-tile"
		class:fontpatch={!mine && value && !error}
		class:ms-tile-error={error && mine}
		on:click={onReveal}
		on:contextmenu={onReveal}
		on:mousedown={() => tileClick$.next([MinesweeperGame.toLinear($width$, x, y), true])}
		style="color: {colorMap[value]}; grid-row: {x + 1}; grid-column: {y + 1};">
		{#if mine}
			<Image class="tile-img" src={assetMap.mine} alt="Mine" />
		{:else if error}
			<Image class="tile-img" src={assetMap.mineFalse} alt="False mine" />
		{:else if value}{value}{/if}
	</div>
{:else}
	<Button
		mousedown={isANeighbourPressed && !mark}
		{disabled}
		on:mousedown={() => tileClick$.next([MinesweeperGame.toLinear($width$, x, y), false])}
		class="button ms-tile ms-tile-font{error ? ' ms-tile-error' : ''}"
		style="grid-row: {x + 1}; grid-column: {y + 1};"
		aria-label="Tile {mark !== FieldMark.EMTPY ? 'mark' : 'unrevealed'}"
		on:click={(e) => onReveal(e)}
		on:contextmenu={(e) => onMark(e)}>
		{#if mark === FieldMark.FLAG}
			<Image class="tile-img" src={assetMap.flag} alt="Flag" />
		{:else if mark === FieldMark.QUESTION}
			<Image class="tile-img" src={assetMap.questionMark} alt="Question mark" />
		{/if}
	</Button>
{/if}
