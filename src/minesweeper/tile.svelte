<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FieldMark } from './minesweeper';
	import { colorMap, tileClick$ } from './store';

	const dispatch = createEventDispatcher();

	export let x: number;
	export let y: number;
	let value: number;
	let revealed: boolean = false;
	let mark: FieldMark;
	let isMine: boolean = false;
	let error: boolean = false;
	export let disabled: boolean = false;

	let onReveal: undefined | ((e: Event) => void);
	let onMark: undefined | ((e: Event) => void);

	export function getX(): number {
		return x;
	}
	export function getY(): number {
		return y;
	}
	export function getValue(): number {
		return value;
	}
	export function getRevealed(): boolean {
		return revealed;
	}
	export function getMark(): FieldMark {
		return mark;
	}

	export function getIsMine(): boolean {
		return isMine;
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

	export function setIsMine(m: boolean): void {
		isMine = m;
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
	.tile {
		height: 40px;
		width: 40px;
		display: block;
		padding: 0;
		box-sizing: border-box;
	}

	div {
		user-select: none;
		font-family: 'Geo', sans-serif;
		background-color: #aaa;
		border-style: solid;
		border-color: #707070;
		border-width: 1px;
		font-size: 60px;
		line-height: 32px;
		text-align: center;

		padding: 2px;
	}

	button {
		font-size: 32px;
		text-align: center;
	}

	.error {
		background-color: red;
	}

	img {
		image-rendering: pixelated;
		width: inherit;
		height: inherit;
		margin-top: -1px;
		margin-left: -1px;
	}
</style>

{#if revealed}
	<div
		class="tile"
		class:error={error && isMine}
		style="color: {colorMap[value]}; grid-row: {x + 1}; grid-column: {y + 1};">
		{#if isMine}
			<img aria-label="mine" src="./assets/minesweeper/mine-small.png" alt="mine" />
		{:else if value}
			{#if error}
				<img aria-label="mine" src="./assets/minesweeper/mine-false-small.png" alt="mine" />
			{:else}{value}{/if}
		{/if}
	</div>
{:else}
	<button
		{disabled}
		class="tile button"
		class:error
		style="grid-row: {x + 1}; grid-column: {y + 1};"
		aria-label="Tile {mark}"
		on:click={onReveal}
		on:mousedown={() => tileClick$.next()}
		on:contextmenu={onMark}>
		{#if mark === 'flag'}
			<img aria-label="flag" src="./assets/minesweeper/flag-small.png" alt="flag" />
		{:else if mark === 'questionMark'}?{/if}
	</button>
{/if}
