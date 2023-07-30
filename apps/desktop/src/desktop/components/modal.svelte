<script lang="ts">
	import type { CoordinateLike } from '@alexaegis/desktop-common';
	import { interval, map, merge, of, startWith, Subject, switchMap, take } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { initialWindowState, type BaseWindowState } from './window-state.interface';
	import Window from './window.svelte';

	export let windowState: Partial<BaseWindowState>;

	$: effectiveWindowState = { ...initialWindowState, ...windowState };

	export let isOpen = false;
	export let dimmed = false;

	const errorNotification = new Subject<void>();

	const errorFlash$ = errorNotification.pipe(
		switchMap(() =>
			merge(
				of(true),
				interval(60).pipe(
					take(6),
					map((_, i) => i % 2 === 0),
				),
			),
		),
		startWith(false),
	);

	const centerOf = (
		position: CoordinateLike,
		size: CoordinateLike,
		sizeOfTarget?: CoordinateLike,
	): CoordinateLike => {
		return {
			x: position.x + Math.floor(size.x / 2) - Math.floor((sizeOfTarget?.x ?? 0) / 2),
			y: position.y + Math.floor(size.y / 2) - Math.floor((sizeOfTarget?.y ?? 0) / 2),
		};
	};

	export function open(parentWindow?: BaseWindowState) {
		windowState.invisible = true;
		isOpen = true;
		// Let the modal window mount before calculating center
		setTimeout(() => {
			windowState.position = centerOf(
				parentWindow?.position ?? { x: 0, y: 0 },
				{
					x: parentWindow?.width ?? document.body.scrollWidth,
					y: parentWindow?.height ?? document.body.scrollHeight,
				},
				{ x: effectiveWindowState.width, y: effectiveWindowState.height },
			);
			windowState.invisible = false;
		}, 0);
	}

	export function close(_event?: CustomEvent<undefined>) {
		// Let stuff clear itself
		setTimeout(() => {
			isOpen = false;
		}, 0);
	}

	export function backdropClick(event: MouseEvent) {
		if ((event.target as Element).className.includes('modal')) {
			errorNotification.next();
		}
	}

	onDestroy(() => {
		errorNotification.complete();
	});
</script>

{#if isOpen}
	<div
		class="modal-backdrop"
		role="button"
		aria-roledescription="closes the modal"
		tabindex="-1"
		class:error="{$errorFlash$}"
		class:dimmed
		style="{$$props['style']}"
		on:keypress
		on:click="{backdropClick}"
	>
		<Window windowState="{effectiveWindowState}" transient="{true}" on:close="{close}">
			<slot />
		</Window>
	</div>
{/if}

<style lang="scss">
	.modal-backdrop {
		position: absolute;
		position: fixed;
		height: 100svh;
		width: 100svw;
		left: 0;
		top: 0;
		z-index: 200000;

		&.dimmed {
			background-color: rgb(0 0 0 / 20%);
		}

		&.error {
			:global(.program-window) {
				:global(.title-bar) {
					filter: brightness(1.2);
				}
			}
		}

		:global(.program-window) {
			position: relative;
			z-index: 200001;
		}
	}
</style>
