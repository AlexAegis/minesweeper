<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { documentPointerDown$ } from '@w2k/core';
	import { filter, tap } from 'rxjs';
	import { onDestroy } from 'svelte';
	export let position: CoordinateLike | undefined;
	let xOffset = 0;
	let yOffset = 0;
	let xDirection = -1;
	let yDirection = -1;

	$: effectivePosition = position
		? { x: position.x + xOffset, y: position.y + yOffset }
		: undefined;

	let contextMenuContainer: HTMLElement | undefined;

	const subscription = documentPointerDown$
		.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return (
					!contextMenuContainer || !elementsUnderPointer.includes(contextMenuContainer)
				);
			}),
			tap(() => {
				position = undefined;
			}),
		)
		.subscribe();

	$: {
		if (position) {
			if (contextMenuContainer) {
				const contextMenuContainerRect = contextMenuContainer.getBoundingClientRect();
				const workspaceElement = document.querySelector('#workspace');

				if (workspaceElement) {
					const workspaceElementRect = workspaceElement.getBoundingClientRect();

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
						yOffset = 0;
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
		style:--context-menu-appear-x-direction="{xDirection}"
		style:--context-menu-appear-y-direction="{yDirection}"
		aria-roledescription="context menu containing contextual buttons"
		role="presentation"
		on:click="{() => {
			position = undefined;
		}}"
	>
		<div class="context-menu window">
			<slot />
		</div>
	</div>
{/if}
