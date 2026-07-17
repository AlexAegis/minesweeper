<script lang="ts">
	import SegmentDisplay from './seven-segment-display.svelte';

	import './segment-display.scss';

	interface Props {
		value: number | undefined;
		paddedLength?: number;
	}

	let { value, paddedLength = 3 }: Props = $props();

	function padArray<T>(array: T[], until: number, padding: T): T[] {
		while (array.length < until) {
			array.unshift(padding);
		}
		return array;
	}

	let numbers: (number | string)[] = $derived.by(() => {
		const digits: (number | string)[] = padArray(
			[...Math.abs(value ?? 0).toString()].map((s) => Number.parseInt(s, 10)),
			paddedLength,
			0,
		);
		if ((value ?? 0) < 0) {
			digits[0] = '-';
		}
		return digits;
	});
</script>

<div class="segment-display panel inset">
	{#each numbers as number, index (index)}
		<SegmentDisplay value={number} />
	{/each}
</div>

<style>
	.segment-display {
		display: flex;
		background-color: black;
	}
</style>
