<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { documentPointerDown$ } from '@w2k/core';
	import { filter, tap } from 'rxjs';
	import { onDestroy, type Snippet } from 'svelte';
	import { readGlobal } from '../helpers';
	import { getWorkspaceRectangle } from '../store/desktop.store';

	interface Props {
		/**
		 * The position can optionally be a recatangle (A DOMRect coming from getBoundingClientRect fits here nicely)
		 * Then the menu will try to spawn from the edge of the area
		 */
		position?: (CoordinateLike & { height?: number; width?: number }) | undefined;
		// An additional element to ignore when detecting if the context menu should be dismissed
		spawnElement?: HTMLElement | undefined;
		xAxisAnimated?: boolean;
		yAxisAnimated?: boolean;
		class?: string | undefined;
		style?: string | undefined;
		onDismiss?: (() => void) | undefined;
		children?: Snippet;
	}

	let {
		position = $bindable(undefined),
		spawnElement = undefined,
		xAxisAnimated = true,
		yAxisAnimated = true,
		class: className = '',
		style = '',
		onDismiss = undefined,
		children = undefined,
	}: Props = $props();

	let xOffset = $state(0);
	let yOffset = $state(0);
	let xDirection = $state(-1);
	let yDirection = $state(-1);

	// Adding the direction is done to let the position effectively ignore the edge of the panel.
	// This will always pushes the corner of the panel 1 px towards the spawn position.
	let effectivePosition = $derived(
		position
			? {
					x: position.x + xOffset + xDirection,
					y: position.y + yOffset + yDirection,
				}
			: undefined,
	);

	let contextMenuContainer: HTMLElement | undefined = $state(undefined);

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
				onDismiss?.();
			}),
		)
		.subscribe();

	$effect(() => {
		if (position) {
			if (contextMenuContainer) {
				// getBoundingClientRect returns screen pixels, but `position` and the
				// offsets are in the zoomed desktop's local space (the container's
				// top/left are scaled by the desktop's `zoom`). The overflow checks
				// compare screen px to screen px, but the flip offsets must be
				// converted back to local space or they overshoot by the zoom factor.
				const zoom = readGlobal('w2kZoom') || 1;
				const contextMenuContainerRect = contextMenuContainer.getBoundingClientRect();
				const workspaceElementRect = getWorkspaceRectangle();

				if (workspaceElementRect) {
					if (workspaceElementRect.right < contextMenuContainerRect.right) {
						xOffset = 1 - contextMenuContainerRect.width / zoom;
						xDirection = 1;
					} else {
						xOffset = 0;
						xDirection = -1;
					}

					if (workspaceElementRect.bottom < contextMenuContainerRect.bottom) {
						yOffset = 1 - contextMenuContainerRect.height / zoom;
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
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});
</script>

{#if effectivePosition !== undefined}
	<div
		bind:this={contextMenuContainer}
		class="context-menu-container"
		style:top={`${effectivePosition.y.toString()}px`}
		style:left={`${effectivePosition.x.toString()}px`}
		style:--context-menu-appear-x-direction={xAxisAnimated ? xDirection : 0}
		style:--context-menu-appear-y-direction={yAxisAnimated ? yDirection : 0}
		aria-roledescription="context menu containing contextual buttons"
		role="presentation"
		onclick={(event) => {
			event.stopPropagation();
			onDismiss?.();
			position = undefined;
		}}
	>
		<div class="context-menu window {className}" {style}>
			{@render children?.()}
		</div>
	</div>
{/if}
