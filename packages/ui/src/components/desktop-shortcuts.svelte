<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { GrippyContainer } from '../helpers/grippy';
	import {
		getWorkspaceRectangle,
		type DesktopSlice,
		type ShortcutId,
		type ShortcutState,
	} from '../store';
	import { areRectanglesOverlapping, type Rectangle } from './rectangle.interface';
	import Shortcut from './shortcut.svelte';

	interface Props {
		grippy: GrippyContainer;
		desktopSlice: DesktopSlice;
		selectArea?: Rectangle | undefined;
	}

	let { grippy, desktopSlice, selectArea = undefined }: Props = $props();

	const shortcutElements: Record<ShortcutId, HTMLElement | undefined> = $state({});

	$effect(() => {
		const workspaceRectangle = getWorkspaceRectangle();
		if (selectArea && workspaceRectangle) {
			const shiftedSelectArea: Rectangle = {
				...selectArea,
				x: selectArea.x + workspaceRectangle.x,
				y: selectArea.y + workspaceRectangle.y,
			};
			const selectedShortcuts = Object.entries(shortcutElements)
				.filter(([_shortcutId, element]) => {
					if (!element) {
						return false;
					}

					const shortcutArea = element.getBoundingClientRect();
					return areRectanglesOverlapping(shortcutArea, shiftedSelectArea);
				})
				.map(([shortcutId]) => Number.parseInt(shortcutId, 10));

			desktopSlice.shortcuts$.internals.shortcutsActions.setSelection.next(selectedShortcuts);
		}
	});

	let shortcutKeys$ = $derived(desktopSlice.dicedShortcuts.keys$);
</script>

{#each $shortcutKeys$ as shortcutKey (shortcutKey)}
	{@const shortcutSlice = desktopSlice.dicedShortcuts.get(shortcutKey)}
	<Observer observable={shortcutSlice}>
		{#snippet children({ next }: { next: ShortcutState })}
			<Shortcut
				{grippy}
				bind:shortcutIconElement={shortcutElements[next.shortcutId]}
				shortcutState={next}
				onSelect={() => {
					desktopSlice.shortcuts$.internals.shortcutsActions.setSelection.next([
						next.shortcutId,
					]);
				}}
				onDelete={() => {
					desktopSlice.shortcuts$.internals.shortcutsActions.deleteSelected.next(
						next.shortcutId,
					);
				}}
				onSpawn={() => {
					desktopSlice.desktop$.internals.actions.spawnProgram.next(next.program);
				}}
				onBeginRename={() => {
					shortcutSlice.update({
						renaming: true,
					});
				}}
				onRename={(rename) => {
					shortcutSlice.update({
						name: rename.name,
						renaming: false,
					});
				}}
				onMove={(position) => {
					desktopSlice.shortcuts$.internals.shortcutsActions.move.next({
						shortcutId: next.shortcutId,
						position,
					});
				}}
				onDrop={(position) => {
					desktopSlice.shortcuts$.internals.shortcutsActions.moveTo.next({
						shortcutId: next.shortcutId,
						position,
					});
				}}
				ondblclick={() => {
					desktopSlice.desktop$.internals.actions.spawnProgram.next(next.program);
				}}
			/>
		{/snippet}
	</Observer>
{/each}
