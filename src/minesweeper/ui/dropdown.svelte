<script lang="ts">
	import { ButtonType } from './button-type.enum';
	import Button from './button.svelte';

	export let open = false;
	export let title: string;
	export let contextHasOpenDropdown: boolean = false;

	function itemClick(event: MouseEvent) {
		console.log(event);
		if ((event.target as Element)?.nodeName === 'BUTTON') {
			open = false;
		}
	}
</script>

<Button
	type={ButtonType.TITLE_BAR_MENU_ITEM}
	on:hover={() => {
		if (contextHasOpenDropdown) {
			open = true;
		}
	}}
	on:click={() => {
		open = true;
		contextHasOpenDropdown = true;
	}}
>
	{title}
</Button>
{#if open}
	<div
		class="dropdown window"
		on:mouseleave={() => (open = false)}
		on:click={(e) => itemClick(e)}
	>
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
