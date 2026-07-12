<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { readGlobal } from '../helpers';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';

	export let title: string;
	export let hotkeyLetter: string | undefined = undefined;

	export let active: string | undefined;
	let justActivated = true;
	let button: HTMLElement;

	// getBoundingClientRect is in screen pixels; the context menu positions itself
	// inside the zoomed `#desktop`, so convert to that local space by dividing by
	// the zoom, matching how the pointer-driven context menus pass their position.
	function getSpawnRectangle(element: HTMLElement): CoordinateLike & { height: number } {
		const rectangle = element.getBoundingClientRect();
		const zoom = readGlobal('w2kZoom') || 1;
		return {
			x: rectangle.x / zoom,
			y: rectangle.y / zoom,
			height: rectangle.height / zoom,
		};
	}

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
	on:pointerenter={pointerenter}
	on:click={click}
	{hotkeyLetter}
>
	{title}

	{#if active === title}
		<ContextMenu
			position={getSpawnRectangle(button)}
			xAxisAnimated={false}
			yAxisAnimated={justActivated}
			spawnElement={button}
			on:dismiss={() => {
				active = undefined;
			}}
		>
			<slot />
		</ContextMenu>
	{/if}
</Button>
