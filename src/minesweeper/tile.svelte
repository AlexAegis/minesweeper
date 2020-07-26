<script lang="ts">
	export let x: number;
	export let y: number;
	export let hasMine: boolean = false;
	export let revealed: boolean = false;
	export let flagged: boolean = false;
	export let value!: 'M' | number;

	export const reveal = (): void => {
		revealed = true;
		flagged = false;
	};

	export const hide = (): void => {
		revealed = false;
		flagged = false;
	};

	const colorMap: Record<any, string> = {
		1: '#0000ff',
		2: '#008100',
		3: '#ff1300',
		4: '#000083',
		5: '#810500',
		6: '#2a9494',
		7: '#000000',
		8: '#808080',
		M: '#000000',
	};

	function onContextMenu(e: Event) {
		e.preventDefault();
		flagged = !flagged;
	}
</script>

<style>
	.tile {
		height: 40px;
		width: 40px;
		display: block;
	}

	div {
		user-select: none;
		font-family: 'Geo', sans-serif;
		background-color: #aaa;
		font-size: 60px;
		line-height: 32px;
		text-align: center;
	}

	button {
		z-index: 100;
		outline: none;
		cursor: pointer;
		border-radius: 0px;
		border-style: outset;
		border-color: #ddd;
		background-color: #ccc;
		color: red;
		font-size: 32px;
		text-align: center;
	}
</style>

{#if revealed}
	<div class="tile" style="color: {colorMap[value]}; grid-row: {x + 1}; grid-column: {y + 1};">
		{#if hasMine}Mine!{:else if value}{value}{/if}
	</div>
{:else}
	<button
		class="tile"
		style="grid-row: {x + 1}; grid-column: {y + 1};"
		on:click
		on:contextmenu={onContextMenu}>
		{#if flagged}F{/if}
	</button>
{/if}
