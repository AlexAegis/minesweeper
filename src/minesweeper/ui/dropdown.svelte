<script lang="ts">
	import { ButtonLook } from './button-type.enum';
	import Button from './button.svelte';

	export let open = false;
	export let title: string;
	export let contextHasOpenDropdown: boolean = false;
	export let hotkeyLetter: string | undefined = undefined;

	function itemClick(event: MouseEvent) {
		if (
			(event.target as Element)?.nodeName !== 'HR' &&
			(event.target as Element)?.nodeName !== 'DIV'
		) {
			open = false;
		}
	}
</script>

<Button
	look={ButtonLook.TITLE_BAR_MENU_ITEM}
	on:hover={() => {
		if (contextHasOpenDropdown) {
			open = true;
		}
	}}
	on:click={() => {
		open = true;
		contextHasOpenDropdown = true;
	}}
	{hotkeyLetter}
>
	{title}
</Button>
{#if open}
	<div class="dropdown window" on:mouseleave={() => (open = false)} on:click={itemClick}>
		<slot />
	</div>
{/if}

<style>
	.dropdown {
		display: flex;
		position: absolute;
		top: 43px;
		min-width: 60px;
		flex-direction: column;

		z-index: 100;
		padding: 2px;
	}
</style>
