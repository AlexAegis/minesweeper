<script lang="ts">
	import { onMount } from 'svelte';
	import DigitalNumber from './digital-number.svelte';

	export let value: number | undefined;
	export let paddedLength = 3;

	function padArray<T>(array: T[], to: number, padding: T): T[] {
		while (array.length < to) {
			array.unshift(padding);
		}
		return array;
	}

	$: numbers = padArray(
		(value ?? 0)
			.toString()
			.split('')
			.map((s) => parseInt(s, 10)),
		paddedLength,
		0
	);

	onMount(() => {
		console.log(numbers);
	});
</script>

<style>
	div {
		display: flex;
		padding: 1px;
		background-color: black;
	}
</style>

<div class="panel inset">
	{#each numbers as number}
		<DigitalNumber value={number} />
	{/each}
</div>
