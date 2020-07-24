<script lang="ts">
	export let x: number;
	export let y: number;
	export let hasMine: boolean;
	export let revealed: boolean = false;
	export let value: number = undefined;

	$: color = getColor(value);
	let gridStyle = getGridStyle(x, y);

	function reveal() {
		revealed = true;
		console.log('reveal');
	}

	function getGridStyle(x: number, y: number) {
		return `grid-row: ${x + 1}; grid-column: ${y + 1};`;
	}

	function getColor(value: number) {
		switch (value) {
			case 1:
				return '#0000ff';
			case 2:
				return '#008100';
			case 3:
				return '#ff1300';
			case 4:
				return '#000083';
			case 5:
				return '#810500';
			case 6:
				return '#2a9494';
			case 7:
				return '#000000';
			case 8:
				return '#808080';
			default:
				return 'black';
		}
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
		outline: none;
		cursor: pointer;
		border-radius: 0px;
		border-style: outset;
		border-color: #ddd;
		background-color: #ccc;
	}
</style>

{#if revealed}
	<div class="tile" style="color: {color}; {gridStyle}" on:click={() => (value = value + 1)}>
		{#if hasMine}Mine!{:else if value}{value}{/if}
	</div>
{:else}
	<button class="tile" style={gridStyle} on:click={reveal} />
{/if}
