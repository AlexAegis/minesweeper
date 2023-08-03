<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { packageMetadata } from '../root.store';
	import { ButtonLook } from './components/button-look.enum';
	import Button from './components/button.svelte';
	import ContextMenu from './components/context-menu.svelte';
	import DesktopShortcuts from './components/desktop-shortcuts.svelte';
	import DesktopWindows from './components/desktop-windows.svelte';
	import TaskbarPrograms from './components/taskbar-programs.svelte';
	import Taskbar from './components/taskbar.svelte';
	import './styles/desktop.scss';

	let contextMenuPosition: CoordinateLike | undefined = undefined;
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
		<DesktopShortcuts />
		<slot />
	</div>
	<div id="window-plane" class="window-plane">
		<DesktopWindows />
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

	<Taskbar>
		<TaskbarPrograms />
	</Taskbar>
</div>
