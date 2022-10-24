<script lang="ts">
	import { padArray } from '../../common';
	import SegmentDisplay from './seven-segment-display.svelte';

	import '../styles/segment-display.scss';

	export let value: number | undefined;
	export let paddedLength = 3;

	let numbers: (number | string)[];

	$: {
		numbers = padArray(
			Math.abs(value ?? 0)
				.toString()
				.split('')
				.map((s) => parseInt(s, 10)),
			paddedLength,
			0
		);
		if ((value ?? 0) < 0) {
			numbers[0] = '-';
		}
	}
</script>

<div class="segment-display">
	{#each numbers as number}
		<SegmentDisplay value={number} />
	{/each}
</div>

<style>
	.segment-display {
		display: flex;

		background-color: black;

		border-style: inset;
	}
</style>
