<script lang="ts">
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';

	export let title: string;
	export let hotkeyLetter: string | undefined = undefined;

	export let active: string | undefined;
	let justActivated = true;
	let button: HTMLElement;

	function pointerenter(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && active !== undefined && active !== title) {
			active = title;
			justActivated = false;
		}
	}

	function click(_event: MouseEvent): void {
		active = active === title ? undefined : title;
		justActivated = true;
	}
</script>

<Button
	bind:button
	look="{ButtonLook.TITLE_BAR_MENU_ITEM}"
	active="{active === title}"
	on:pointerenter="{pointerenter}"
	on:click="{click}"
	{hotkeyLetter}
>
	{title}

	{#if active === title}
		<ContextMenu
			position="{button.getBoundingClientRect()}"
			xAxisAnimated="{false}"
			yAxisAnimated="{justActivated}"
			spawnElement="{button}"
			on:dismiss="{() => {
				active = undefined;
			}}"
		>
			<slot />
		</ContextMenu>
	{/if}
</Button>
