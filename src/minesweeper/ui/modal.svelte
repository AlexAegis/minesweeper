<script lang="ts">
	import { interval, map, merge, of, startWith, Subject, switchMap, take } from 'rxjs';
	import { onDestroy } from 'svelte';
	import type { BaseWindowState } from './window-state.interface';
	import Window from './window.svelte';

	export let title: string;

	let windowState: Partial<BaseWindowState> = {
		height: 400,
		icon: undefined,
		maximized: false,
		resizable: true,
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

	export function open() {
		isOpen = true;
	}

	export function close(event?: MouseEvent) {
		if ((event?.target as Element)?.className.includes('ms-modal') ?? true) {
			isOpen = false;
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
		on:click|preventDefault={backdropClick}
	>
		<Window {windowState} transient={true} on:close={() => close()}>
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
