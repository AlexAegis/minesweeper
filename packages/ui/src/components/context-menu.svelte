<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { documentPointerDown$ } from '@w2k/core';
	import { filter, tap } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { getWorkspaceRectangle } from '../store/desktop.store';

	const dispatcher = createEventDispatcher<{
		dismiss: undefined;
	}>();

	/**
	 * The position can optionally be a recatangle (A DOMRect coming from getBoundingClientRect fits here nicely)
	 * Then the menu will try to spawn from the edge of the area
	 */
	export let position: (CoordinateLike & { height?: number; width?: number }) | undefined =
		undefined;

	// An additional element to ignore when detecting if the context menu should be dismissed
	export let spawnElement: HTMLElement | undefined = undefined;

	export let xAxisAnimated = true;
	export let yAxisAnimated = true;

	let xOffset = 0;
	let yOffset = 0;
	let xDirection = -1;
	let yDirection = -1;

	// Adding the direction is done to let the position effectively ignore the edge of the panel.
	// This will always pushes the corner of the panel 1 px towards the spawn position.
	$: effectivePosition = position
		? {
				x: position.x + xOffset + xDirection,
				y: position.y + yOffset + yDirection,
		  }
		: undefined;

	let contextMenuContainer: HTMLElement | undefined;

	const subscription = documentPointerDown$
		.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return (
					(!contextMenuContainer ||
						!elementsUnderPointer.includes(contextMenuContainer)) &&
					(!spawnElement || !elementsUnderPointer.includes(spawnElement))
				);
			}),
			tap(() => {
				position = undefined;
				dispatcher('dismiss');
			}),
		)
		.subscribe();

	$: {
		if (position) {
			if (contextMenuContainer) {
				const contextMenuContainerRect = contextMenuContainer.getBoundingClientRect();
				const workspaceElementRect = getWorkspaceRectangle();

				if (workspaceElementRect) {
					if (workspaceElementRect.right < contextMenuContainerRect.right) {
						xOffset = 1 - contextMenuContainerRect.width;
						xDirection = 1;
					} else {
						xOffset = 0;
						xDirection = -1;
					}

					if (workspaceElementRect.bottom < contextMenuContainerRect.bottom) {
						yOffset = 1 - contextMenuContainerRect.height;
						yDirection = 1;
					} else {
						yOffset = position.height ?? 0;
						yDirection = -1;
					}
				}
			} else {
				xOffset = 0;
				xDirection = -1;
				yOffset = 0;
				yDirection = -1;
			}
		}
	}

	onDestroy(() => {
		subscription.unsubscribe();
	});
</script>

{#if effectivePosition !== undefined}
	<div
		bind:this="{contextMenuContainer}"
		class="context-menu-container"
		style:top="{`${effectivePosition.y}px`}"
		style:left="{`${effectivePosition.x}px`}"
		style:--context-menu-appear-x-direction="{xAxisAnimated ? xDirection : 0}"
		style:--context-menu-appear-y-direction="{yAxisAnimated ? yDirection : 0}"
		aria-roledescription="context menu containing contextual buttons"
		role="presentation"
		on:click|stopPropagation="{() => {
			dispatcher('dismiss');
			position = undefined;
		}}"
	>
		<div class="context-menu window {$$props['class'] ?? ''}" style="{$$props['style'] ?? ''}">
			<slot />
		</div>
	</div>
{/if}
