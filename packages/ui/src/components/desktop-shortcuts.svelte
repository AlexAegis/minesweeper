<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { GrippyContainer } from '../helpers/grippy';
	import { getWorkspaceRectangle, type DesktopSlice, type ShortcutId } from '../store';
	import { areRectanglesOverlapping, type Rectangle } from './rectangle.interface';
	import Shortcut from './shortcut.svelte';

	export let grippy: GrippyContainer;
	export let desktopSlice: DesktopSlice;
	export let selectArea: Rectangle | undefined = undefined;

	const shortcutElements: Record<ShortcutId, HTMLElement | undefined> = {};

	$: {
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
	}

	$: shortcutKeys$ = desktopSlice.dicedShortcuts.keys$;
</script>

{#each $shortcutKeys$ as shortcutKey}
	{@const shortcutSlice = desktopSlice.dicedShortcuts.get(shortcutKey)}
	<Observer observable="{shortcutSlice}" let:next>
		<Shortcut
			{grippy}
			bind:shortcutIconElement="{shortcutElements[next.shortcutId]}"
			shortcutState="{next}"
			on:select="{(_event) => {
				desktopSlice.shortcuts$.internals.shortcutsActions.setSelection.next([
					next.shortcutId,
				]);
			}}"
			on:delete="{() => {
				desktopSlice.shortcuts$.internals.shortcutsActions.deleteSelected.next(
					next.shortcutId,
				);
			}}"
			on:spawn="{() => {
				desktopSlice.desktop$.internals.actions.spawnProgram.next(next.program);
			}}"
			on:beginRename="{() => {
				shortcutSlice.update({
					renaming: true,
				});
			}}"
			on:rename="{(event) => {
				shortcutSlice.update({
					name: event.detail.name,
					renaming: false,
				});
			}}"
			on:move="{(event) => {
				desktopSlice.shortcuts$.internals.shortcutsActions.move.next({
					shortcutId: next.shortcutId,
					position: event.detail,
				});
			}}"
			on:drop="{(event) => {
				desktopSlice.shortcuts$.internals.shortcutsActions.moveTo.next({
					shortcutId: next.shortcutId,
					position: event.detail,
				});
			}}"
			on:dblclick="{(event) => {
				event.target;
				desktopSlice.desktop$.internals.actions.spawnProgram.next(next.program);
			}}"
		/>
	</Observer>
{/each}
