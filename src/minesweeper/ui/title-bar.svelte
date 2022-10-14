<script lang="ts">
	import Image from './image.svelte';

	import { filter, fromEvent, merge, Subscription, tap } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { tap as tapGesture } from 'svelte-gestures';

	const dispatch = createEventDispatcher();

	type PointerType = 'mouse' | 'touch';

	export let title: string;
	export let icon: string | undefined = undefined;
	export let active: boolean = true;
	export let maximized: boolean = false;
	export let resizable: boolean = true;
	let dragging: { x: number; y: number; pointerType: PointerType } | undefined;

	const sink = new Subscription();

	const htmlRef = document.getElementsByTagName('html')?.[0];

	sink.add(
		merge(fromEvent(document, 'mouseup'), fromEvent(document, 'mouseleave'))
			.pipe(
				filter(() => !!dragging),
				tap(() => (dragging = undefined))
			)
			.subscribe()
	);
	sink.add(
		fromEvent(document, 'mousemove')
			.pipe(
				filter((event: Event) => !!dragging && event.target !== htmlRef),
				tap((event: Event) => mousemove(event as MouseEvent))
			)
			.subscribe()
	);

	let titleBar: Element;

	function minimize() {
		dispatch('minimize');
	}

	function maximize() {
		if (maximized) {
			dispatch('restore');
		} else {
			dispatch('maximize');
		}
	}

	function close() {
		dispatch('close');
	}

	function tapup(_event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) {
		if (dragging?.pointerType === 'touch') {
			dragging = undefined;
		}
	}

	function tapdown(event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) {
		dragging = {
			x: event.detail.event.clientX,
			y: event.detail.event.clientY,
			pointerType: event.detail.event.pointerType as PointerType,
		};
	}

	function tapmove(event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) {
		if (dragging && !maximized && event.detail.event.pointerType === 'touch') {
			const rect = titleBar.getBoundingClientRect();
			let x = rect.left - dragging.x + event.detail.event.clientX - 3;
			let y = rect.top - dragging.y + event.detail.event.clientY - 3;
			dragging.x = event.detail.event.clientX;
			dragging.y = event.detail.event.clientY;
			dispatch('drag', { x, y });
		}
	}

	function mousemove(event: MouseEvent) {
		if (dragging && !maximized) {
			const rect = titleBar.getBoundingClientRect();
			let x = rect.left - dragging.x + event.clientX - 3;
			let y = rect.top - dragging.y + event.clientY - 3;
			dragging.x = event.clientX;
			dragging.y = event.clientY;
			dispatch('drag', { x, y });
		}
	}

	onDestroy(() => sink.unsubscribe());
</script>

<div
	class="title-bar"
	bind:this={titleBar}
	on:dblclick={maximize}
	on:tap
	use:tapGesture
	on:mousemove={mousemove}
	on:tapup={tapup}
	on:tapdown={tapdown}
	on:tapmove={tapmove}
>
	<div aria-label="title" class="title-bar-text" class:active>
		{#if icon}
			<Image class="ms-title-bar-icon" src={icon} alt={title} />
		{/if}
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		<button
			aria-label="Minimize"
			on:click|preventDefault|stopPropagation={minimize}
			on:tap|preventDefault|stopPropagation={minimize}
			on:mousemove|preventDefault|stopPropagation
			on:mousedown|preventDefault|stopPropagation
			on:dblclick|preventDefault|stopPropagation
		/>
		<button
			aria-label={maximized ? 'Restore' : 'Maximize'}
			on:click|preventDefault|stopPropagation={maximize}
			on:tap|preventDefault|stopPropagation={maximize}
			on:mousemove|preventDefault|stopPropagation
			on:mousedown|preventDefault|stopPropagation
			on:dblclick|preventDefault|stopPropagation
			disabled={!resizable}
		/>
		<button
			aria-label="Close"
			on:click|preventDefault|stopPropagation={close}
			on:tap|preventDefault|stopPropagation={close}
			on:mousemove|preventDefault|stopPropagation
			on:mousedown|preventDefault|stopPropagation
			on:dblclick|preventDefault|stopPropagation
		/>
	</div>
</div>

<style lang="scss">
	// 98.css
	.title-bar {
		user-select: none;

		// 98.css
		.title-bar-text {
			display: flex;
			gap: 2px;
			align-items: center;
			text-transform: capitalize;
		}

		:global(.ms-title-bar-icon) {
			filter: drop-shadow(0px 0px 8px rgba(180, 180, 255, 0.8));
			max-height: 13px;
		}
	}
</style>
