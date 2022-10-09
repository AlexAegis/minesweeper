<script lang="ts">
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';

	export let title: string;
	export let hotkeyLetter: string | undefined = undefined;

	export let active: string | undefined;

	function itemClick(event: MouseEvent) {
		console.log('(event.target as Element)?.nodeName', (event.target as Element)?.nodeName);
		if (
			(event.target as Element)?.nodeName !== 'HR' &&
			(event.target as Element)?.nodeName !== 'DIV'
		) {
			active = undefined;
		}
	}
</script>

<Button
	look={ButtonLook.TITLE_BAR_MENU_ITEM}
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
