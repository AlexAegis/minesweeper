<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements';

	interface Props {
		name: string;
		options: Record<string, string>;
		value?: string | undefined;
		disabled?: boolean;
		class?: string | undefined;
		style?: string | undefined;
		onchange?: ChangeEventHandler<HTMLSelectElement> | undefined;
	}

	let {
		name,
		options,
		value = $bindable(undefined),
		disabled = false,
		class: className = '',
		style = '',
		onchange = undefined,
	}: Props = $props();
</script>

<select {name} id={name} bind:value {onchange} {disabled} class={className} {style}>
	{#each Object.keys(options) as optionKey (optionKey)}
		<option value={optionKey}>{options[optionKey]}</option>
	{/each}
</select>
