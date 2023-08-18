<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import {
		getWorkspaceRectangle,
		snapShortcutPosition,
		type DesktopSlice,
		type ShortcutId,
	} from '../store';
	import { areRectanglesOverlapping, type Rectangle } from './rectangle.interface';
	import Shortcut from './shortcut.svelte';

	export let desktopSlice: DesktopSlice;
	export let selectArea: Rectangle | undefined = undefined;

	let shortcutElements: Record<ShortcutId, HTMLElement | undefined> = {};

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
			{desktopSlice}
			bind:shortcutIconElement="{shortcutElements[shortcutKey]}"
			shortcutState="{next}"
			on:select="{(_event) => {
				shortcutSlice.internals.shortcutActions.select.next(next.shortcutId);
			}}"
			on:drop="{(event) => {
				shortcutSlice.internals.position$.set(snapShortcutPosition(event.detail));
			}}"
			on:dblclick="{(event) => {
				event.target;
				desktopSlice.desktop$.internals.actions.spawnProgram.next(next.program);
			}}"
		/>
	</Observer>
{/each}
