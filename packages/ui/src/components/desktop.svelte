<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { documentPointerMove$, documentPointerUp$, packageMetadata } from '@w2k/core';
	import { onDestroy } from 'svelte';
	import type { DesktopSlice, ProgramId } from '../store';
	import AreaSelection from './area-selection.svelte';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';
	import DesktopShortcuts from './desktop-shortcuts.svelte';
	import DesktopWindows from './desktop-windows.svelte';
	import type { Rectangle } from './rectangle.interface';
	import TaskbarPrograms from './taskbar-programs.svelte';
	import Taskbar from './taskbar.svelte';
	import type { WindowComponents } from './window-state.interface';

	let contextMenuPosition: CoordinateLike | undefined = undefined;
	export let windowComponents: Record<ProgramId, WindowComponents>;
	let workspaceElement: HTMLDivElement;
	export let desktopSlice: DesktopSlice;

	let selectArea: (Rectangle & { origin: CoordinateLike }) | undefined;

	function areaSelectionBegin(event: PointerEvent) {
		const workspaceRect = workspaceElement.getBoundingClientRect();
		const origin: CoordinateLike = {
			x: event.pageX - workspaceRect.x,
			y: event.pageY - workspaceRect.y,
		};
		selectArea = {
			...origin,
			height: 0,
			width: 0,
			origin,
		};
	}

	function areaSelectionEnd(_event: PointerEvent) {
		if (selectArea) {
			selectArea = undefined;
		}
	}

	function areaSelectionMove(event: PointerEvent) {
		if (!selectArea) {
			return;
		}

		const workspaceRect = workspaceElement.getBoundingClientRect();

		const cursorX = event.pageX - workspaceRect.x;
		const cursorY = event.pageY - workspaceRect.y;

		const areaMinX = Math.min(selectArea.origin.x, cursorX);
		const areaMinY = Math.min(selectArea.origin.y, cursorY);
		const areaMaxX = Math.max(selectArea.origin.x, cursorX);
		const areaMaxY = Math.max(selectArea.origin.y, cursorY);

		const areaDesiredWidth = areaMaxX - areaMinX;
		const areaDesiredHeight = areaMaxY - areaMinY;

		selectArea.x = Math.max(areaMinX, 0);
		selectArea.y = Math.max(areaMinY, 0);

		const maxWidthBoundary =
			cursorX > selectArea.origin.x ? workspaceRect.x + workspaceRect.width : workspaceRect.x;
		const maxHeightBoundary =
			cursorY > selectArea.origin.y
				? workspaceRect.y + workspaceRect.height
				: workspaceRect.y;

		const maxWidth = Math.abs(selectArea.origin.x - maxWidthBoundary + workspaceRect.x);
		const maxHeight = Math.abs(selectArea.origin.y - maxHeightBoundary + workspaceRect.y);

		selectArea.width = Math.min(areaDesiredWidth, maxWidth);
		selectArea.height = Math.min(areaDesiredHeight, maxHeight);
	}

	const globalPointerUpListener = documentPointerUp$.subscribe(areaSelectionEnd);
	const globalPointerMoveListener = documentPointerMove$.subscribe(areaSelectionMove);

	onDestroy(() => {
		globalPointerUpListener.unsubscribe();
		globalPointerMoveListener.unsubscribe();
	});
</script>

<div id="desktop" class="desktop w98 w2k w2k-scheme-standard">
	<div
		bind:this="{workspaceElement}"
		id="workspace"
		class="workspace"
		role="directory"
		aria-roledescription="desktop workspace containing the icons"
		on:pointerdown="{(e) => areaSelectionBegin(e)}"
		on:contextmenu|preventDefault="{(event) => {
			contextMenuPosition = contextMenuPosition
				? undefined
				: { x: event.pageX, y: event.pageY };
		}}"
	>
		<DesktopShortcuts {desktopSlice} />

		<AreaSelection area="{selectArea}" />
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
