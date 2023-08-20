<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { readGlobal } from '../helpers/w2k-globals';
	import { formatPid, type DesktopSlice, type DicedWindow } from '../store/desktop.store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';
	import { getMinimizeAnimation } from './taskbar-animation';
	import TitleBar from './title-bar.svelte';
	import WindowContextItems from './window-context-items.svelte';
	import type { WindowState } from './window-state.interface';

	export let desktopSlice: DesktopSlice;

	export let next: WindowState;
	export let windowSlice: DicedWindow;
	let forceAppearActive = false;
	let contextMenuPosition: CoordinateLike | undefined = undefined;

	$: {
		forceAppearActive = !!contextMenuPosition;
	}
</script>

<Button
	id="{formatPid(next.processId, 'taskbar')}"
	class="{formatPid(next.processId)}"
	look="{ButtonLook.TASKBAR_ITEM}"
	active="{forceAppearActive ? true : next.active}"
	icon="{next.titleBarIcon}"
	on:click="{() => {
		if (next.active) {
			windowSlice.internals.minimized$.set('start-minimizing');
		} else {
			desktopSlice.desktop$.internals.actions.activateProgram.next(next.processId);
		}
	}}"
	on:contextmenu="{(event) => {
		contextMenuPosition = contextMenuPosition
			? undefined
			: { x: event.pageX / readGlobal('w2kZoom'), y: event.pageY / readGlobal('w2kZoom') };
	}}"
>
	{next.title}

	<ContextMenu bind:position="{contextMenuPosition}">
		<WindowContextItems windowState="{next}" {windowSlice} {desktopSlice} />
	</ContextMenu>
</Button>

{#if next.minimized === 'minimizing' || next.minimized === 'unminimizing'}
	<TitleBar
		windowState="{next}"
		{desktopSlice}
		{windowSlice}
		class="animate"
		style="{getMinimizeAnimation(next, next.minimized)}"
		title="{next.title}"
		icon="{next.titleBarIcon}"
		showMaximize="{false}"
		showMinimize="{false}"
		showHelp="{false}"
		showClose="{false}"
	/>
{/if}
