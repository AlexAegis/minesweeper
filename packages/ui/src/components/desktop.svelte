<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { packageMetadata } from '@w2k/core';
	import { onDestroy, onMount } from 'svelte';
	import { desktopColorSchemeToCssVariables, joinStyleMap } from '..';
	import { readGlobal, writeGlobal, type Handler } from '../helpers';
	import { GrippyContainer } from '../helpers/grippy/grippy';
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
	let desktopElement: HTMLDivElement;

	export let desktopSlice: DesktopSlice;
	$: activeSchemeData$ = desktopSlice.activeSchemeData$;
	$: activeSchemeKind$ = desktopSlice.activeSchemeKind$;

	let selectArea: Rectangle | undefined;
	let selectAreaStart: Rectangle | undefined;

	export let zoom = 1;

	const grippy = new GrippyContainer({
		zoom,
	});

	$: {
		writeGlobal('w2kZoom', zoom);
	}

	let selectionDraggable: Handler | undefined;

	onMount(() => {
		grippy.options.rootElement = desktopElement;
		grippy.initialize(workspaceElement);

		selectionDraggable = grippy.draggable({
			target: workspaceElement,
			listeners: {
				moveBegin: (e) => {
					// This is separated to avoid starting anything related to area selection for simple clicks
					selectAreaStart = {
						...e.cursor.client,
						height: 0,
						width: 0,
					};
					selectArea = undefined;
				},
				move: (e) => {
					if (selectAreaStart && !selectArea) {
						selectArea = selectAreaStart;
						selectAreaStart = undefined;
					}

					if (!selectArea) {
						return;
					}

					const workspaceRect = workspaceElement.getBoundingClientRect();

					const cursorX = e.cursor.client.x;
					const cursorY = e.cursor.client.y;

					const areaMinX = Math.min(e.cursor.origin.x, cursorX);
					const areaMinY = Math.min(e.cursor.origin.y, cursorY);
					const areaMaxX = Math.max(e.cursor.origin.x, cursorX);
					const areaMaxY = Math.max(e.cursor.origin.y, cursorY);

					const areaDesiredWidth = areaMaxX - areaMinX;
					const areaDesiredHeight = areaMaxY - areaMinY;

					selectArea.x = Math.max(areaMinX, 0);
					selectArea.y = Math.max(areaMinY, 0);

					const maxWidthBoundary =
						cursorX > e.cursor.origin.x
							? workspaceRect.x + workspaceRect.width
							: workspaceRect.x;
					const maxHeightBoundary =
						cursorY > e.cursor.origin.y
							? workspaceRect.y + workspaceRect.height
							: workspaceRect.y;

					const maxWidth = Math.abs(
						e.cursor.origin.x - maxWidthBoundary + workspaceRect.x,
					);
					const maxHeight = Math.abs(
						e.cursor.origin.y - maxHeightBoundary + workspaceRect.y,
					);

					selectArea.width = Math.min(areaDesiredWidth, maxWidth);
					selectArea.height = Math.min(areaDesiredHeight, maxHeight);
				},
				moveEnd: (_e) => {
					selectAreaStart = undefined;
					selectArea = undefined;
				},
			},
		});
	});

	onDestroy(() => {
		selectionDraggable?.unsubscribe();
		grippy.unsubscribe();
	});
</script>

<div
	id="desktop"
	class="desktop w2k {$activeSchemeKind$}"
	bind:this="{desktopElement}"
	style="{joinStyleMap(desktopColorSchemeToCssVariables($activeSchemeData$))};
	zoom: {100 * zoom}%;"
>
	<div
		bind:this="{workspaceElement}"
		id="workspace"
		class="workspace free-placement"
		role="directory"
		aria-roledescription="desktop workspace containing the icons"
		on:contextmenu|preventDefault="{(event) => {
			contextMenuPosition = contextMenuPosition
				? undefined
				: {
						x: event.pageX / readGlobal('w2kZoom'),
						y: event.pageY / readGlobal('w2kZoom'),
				  };
		}}"
	>
		<DesktopShortcuts {desktopSlice} {selectArea} {grippy} />
		<slot />
		<div id="selection-plane" class="selection-plane">
			<AreaSelection area="{selectArea}" />
		</div>
	</div>

	<div id="window-plane" class="window-plane">
		<DesktopWindows {desktopSlice} {windowComponents} {grippy} />
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
		<hr />
		<Button
			look="{ButtonLook.CONTEXT_MENU_ITEM}"
			on:click="{() =>
				desktopSlice.desktop$.internals.actions.spawnProgram.next('displayProperties')}"
		>
			Properties
		</Button>
	</ContextMenu>

	<Taskbar {desktopSlice}>
		<TaskbarPrograms {desktopSlice} />
	</Taskbar>
</div>
