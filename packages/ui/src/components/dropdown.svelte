<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getSpawnRectangle } from '../helpers';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';

	interface Props {
		title: string;
		hotkeyLetter?: string | undefined;
		active: string | undefined;
		children?: Snippet;
	}

	let { title, hotkeyLetter = undefined, active = $bindable(), children }: Props = $props();
	let justActivated = $state(true);
	let button: HTMLElement = $state()!;

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
	look={ButtonLook.TITLE_BAR_MENU_ITEM}
	active={active === title}
	onpointerenter={pointerenter}
	onclick={click}
	{hotkeyLetter}
>
	{title}

	{#if active === title}
		<ContextMenu
			position={getSpawnRectangle(button)}
			xAxisAnimated={false}
			yAxisAnimated={justActivated}
			spawnElement={button}
			onDismiss={() => {
				active = undefined;
			}}
		>
			{@render children?.()}
		</ContextMenu>
	{/if}
</Button>
