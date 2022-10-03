<script lang="ts">
	import { padArray } from '../helper';
	import DigitalNumber from '../ui/digital-number.svelte';

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

<div class="panel inset">
	{#each numbers as number}
		<DigitalNumber value={number} />
	{/each}
</div>

<style>
	div {
		display: flex;
		padding: 1px;
		background-color: black;
	}
</style>
