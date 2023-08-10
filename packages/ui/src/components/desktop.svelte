<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { packageMetadata } from '@w2k/core';
	import type { DesktopSlice, ProgramId } from '../store';
	import '../styles/desktop.scss';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';
	import DesktopShortcuts from './desktop-shortcuts.svelte';
	import DesktopWindows from './desktop-windows.svelte';
	import TaskbarPrograms from './taskbar-programs.svelte';
	import Taskbar from './taskbar.svelte';
	import type { WindowComponents } from './window-state.interface';

	let contextMenuPosition: CoordinateLike | undefined = undefined;
	export let windowComponents: Record<ProgramId, WindowComponents>;

	export let desktopSlice: DesktopSlice;
</script>

<div id="desktop" class="desktop w98 w2k w2k-scheme-standard">
	<div
		id="workspace"
		class="workspace"
		role="directory"
		aria-roledescription="desktop workspace containing the icons"
		on:contextmenu|preventDefault="{(event) => {
			contextMenuPosition = contextMenuPosition
				? undefined
				: { x: event.pageX, y: event.pageY };
		}}"
	>
		<DesktopShortcuts {desktopSlice} />
		<slot />
	</div>
	<div id="window-plane" class="window-plane">
		<DesktopWindows {desktopSlice} {windowComponents} />
	</div>

	<ContextMenu bind:position="{contextMenuPosition}">
		<Button look="{ButtonLook.CONTEXT_MENU_ITEM}" on:click="{() => console.log('Hello world')}">
			Hello
		</Button>

		<Button
			look="{ButtonLook.CONTEXT_MENU_ITEM}"
			on:click="{() => window.open(packageMetadata.homepage, '_blank')}"
		>
			Github
		</Button>
	</ContextMenu>

	<Taskbar {desktopSlice}>
		<TaskbarPrograms {desktopSlice} />
	</Taskbar>
</div>
