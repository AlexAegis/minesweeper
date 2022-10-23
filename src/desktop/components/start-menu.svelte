<script lang="ts">
	import { filter, fromEvent } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { PACKAGE_NAME_AND_VERSION } from '../../root.store';
	import { startMenuOpen$ } from '../store';

	let startMenu: HTMLElement;
	export let startButton: HTMLElement;

	const clickListener = fromEvent<PointerEvent>(document, 'pointerup')
		.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return (
					!elementsUnderPointer.includes(startMenu) &&
					!elementsUnderPointer.includes(startButton)
				);
			})
		)
		.subscribe(() => startMenuOpen$.set(false));

	onDestroy(() => clickListener.unsubscribe());
</script>

<div bind:this={startMenu} class="start-menu window">
	<div class="title">
		<div>{PACKAGE_NAME_AND_VERSION}</div>
	</div>
	<div class="content">
		<div class="entry" />
	</div>
</div>

<style lang="scss">
	.start-menu {
		z-index: 1000;
		height: 360px;
		width: 200px;

		display: flex;

		.title {
			display: flex;
			align-items: flex-end;

			width: 20px;
			height: 100%;
			background: linear-gradient(black, blue);

			div {
				color: white;
				overflow: hidden;
				justify-self: end;
				align-self: end;
				font-weight: bold;
				flex-flow: nowrap;
				text-overflow: ellipsis;
				writing-mode: vertical-lr;
				transform: rotate(180deg);
				text-orientation: sideways;
				width: 100%;
				/* margin-top: 8px; */
				padding: 4px;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
		}
	}
</style>
