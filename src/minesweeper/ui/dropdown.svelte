<script lang="ts">
	import { filter, fromEvent } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';

	export let title: string;
	export let hotkeyLetter: string | undefined = undefined;

	export let active: string | undefined;

	let button: Button;

	const clickListener = fromEvent(document, 'click')
		.pipe(filter((event) => !button.$$.root.contains(event.target as Node)))
		.subscribe(() => (active = undefined));

	function itemClick(event: MouseEvent) {
		if (
			(event.target as Element)?.nodeName !== 'HR' &&
			(event.target as Element)?.nodeName !== 'DIV'
		) {
			active = undefined;
		}
	}

	onDestroy(() => clickListener.unsubscribe());
</script>

<Button
	bind:this={button}
	look={ButtonLook.TITLE_BAR_MENU_ITEM}
	active={active === title}
	disableSelfInset={active === undefined}
	on:mouseenter={() => {
		if (active !== undefined && active !== title) {
			active = title;
		}
	}}
	on:click={() => {
		active = active === title ? undefined : title;
	}}
	{hotkeyLetter}
>
	{title}
	{#if active === title}
		<div class="dropdown window" on:click|preventDefault|stopPropagation={itemClick}>
			<slot />
		</div>
	{/if}
</Button>

<style>
	.dropdown {
		display: flex;
		position: absolute;
		top: 43px;
		min-width: 150px;
		flex-direction: column;
		margin-left: -12px;

		z-index: 100;
		padding: 2px;
	}
</style>
