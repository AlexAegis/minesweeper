<script lang="ts">
	import { padArray } from '../helper';
	import DigitalNumber from './digital-number.svelte';

	export let value: number | undefined;
	export let paddedLength = 3;

	$: numbers = padArray(
		(value ?? 0)
			.toString()
			.split('')
			.map((s) => parseInt(s, 10)),
		paddedLength,
		0
	);
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
