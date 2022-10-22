<script lang="ts">
	import { interval, map, merge, of, startWith, Subject, switchMap, take } from 'rxjs';
	import { onDestroy } from 'svelte';
	import type { CoordinateLike } from '../core';
	import type { BaseWindowState } from './window-state.interface';
	import Window from './window.svelte';

	export let title: string;

	let modalWindow: Window;

	let windowState: Partial<BaseWindowState> = {
		height: 200,
		icon: undefined,
		maximized: false,
		resizable: true,
		fitContent: true,
		title,
	};

	export let isOpen: boolean = false;

	let errorNotification = new Subject<void>();

	let error$ = errorNotification.pipe(
		switchMap(() =>
			merge(
				of(true),
				interval(60).pipe(
					take(6),
					map((_, i) => i % 2 === 0)
				)
			)
		),
		startWith(false)
	);

	const centerOf = (
		position: CoordinateLike,
		size: CoordinateLike,
		sizeOfTarget?: CoordinateLike
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
				{ x: windowState.width ?? 0, y: windowState.height ?? 0 }
			);
			windowState.invisible = false;
		}, 0);
	}

	export function close(event?: MouseEvent) {
		if ((event?.target as Element)?.className.includes('ms-modal') ?? true) {
			// Let stuff clear itself
			setTimeout(() => {
				isOpen = false;
			}, 0);
		}
	}

	export function backdropClick(event: MouseEvent) {
		if ((event?.target as Element)?.className.includes('ms-modal')) {
			errorNotification.next();
		}
	}

	onDestroy(() => {
		errorNotification.complete();
	});
</script>

{#if isOpen}
	<div
		class="ms-modal"
		class:error={$error$}
		style={$$props.style}
		on:keypress
		on:click|preventDefault={backdropClick}
	>
		<Window bind:this={modalWindow} {windowState} transient={true} on:close={() => close()}>
			<slot />
		</Window>
	</div>
{/if}

<style lang="scss">
	.ms-modal {
		position: absolute;
		position: fixed;
		height: 100%;
		width: 100%;
		left: 0;
		top: 0;
		z-index: 900;

		background-color: rgba(0, 0, 0, 0.05);

		&.error {
			:global(.ms-window) {
				:global(.title-bar) {
					filter: brightness(1.2);
				}
			}
		}

		:global(.ms-window) {
			position: relative;
			z-index: 1000;
		}
	}
</style>
