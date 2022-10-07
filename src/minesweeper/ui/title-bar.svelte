<script lang="ts">
	import Image from './image.svelte';

	import { filter, fromEvent, merge, Subscription, tap } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let inactive: boolean = false;
	export let maximized: boolean = false;
	export let resizable: boolean = true;
	let dragging: { x: number; y: number } | undefined;

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
				tap((event: Event) => drag(event as MouseEvent))
			)
			.subscribe()
	);

	let titleBar: Element;

	function drag(event: MouseEvent) {
		if (dragging && !maximized) {
			const rect = titleBar.getBoundingClientRect();
			let x = rect.left - dragging.x + event.clientX - 3;
			let y = rect.top - dragging.y + event.clientY - 3;
			dragging.x = event.clientX;
			dragging.y = event.clientY;
			dispatch('drag', { x, y });
		}
	}

	function startDrag(event: MouseEvent) {
		dragging = { x: event.clientX, y: event.clientY };
	}

	function minimize(event: MouseEvent) {
		event.stopPropagation();
		dispatch('minimize');
	}

	function maximize(event: MouseEvent) {
		event.stopPropagation();
		if (maximized) {
			dispatch('restore');
		} else {
			dispatch('maximize');
		}
	}

	function close(event: MouseEvent) {
		event.stopPropagation();
		dispatch('close');
	}

	function noop(event: MouseEvent) {
		event?.stopPropagation();
		event?.preventDefault();
	}

	onDestroy(() => sink.unsubscribe());
</script>

<div class="title-bar" on:mousedown={startDrag} bind:this={titleBar} on:dblclick={maximize}>
	<div aria-label="title" class="title-bar-text" class:inactive>
		{#if icon}
			<Image class="ms-title-bar-icon" src={icon} alt={title} />
		{/if}
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		<button
			aria-label="Minimize"
			on:click={minimize}
			on:mousemove={noop}
			on:mousedown={noop}
			on:dblclick={noop}
		/>
		<button
			aria-label={maximized ? 'Restore' : 'Maximize'}
			on:click={maximize}
			on:mousemove={noop}
			on:mousedown={noop}
			on:dblclick={noop}
			disabled={!resizable}
		/>
		<button
			aria-label="Close"
			on:click={close}
			on:mousemove={noop}
			on:mousedown={noop}
			on:dblclick={noop}
		/>
	</div>
</div>

<style>
	.title-bar {
		user-select: none;
	}

	:global(.ms-title-bar-icon) {
		filter: drop-shadow(0px 0px 8px rgba(180, 180, 255, 0.8));
		max-height: 13px;
	}

	.title-bar-text {
		display: flex;
		gap: 2px;
		align-items: center;
	}
</style>
