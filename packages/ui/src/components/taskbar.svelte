<script lang="ts">
	import type { Snippet } from 'svelte';
	import Clock from './clock.svelte';

	import Image from './image.svelte';

	import { debugIcon } from '../assets/misc';
	import type { DesktopSlice } from '../store/desktop.store';
	import StartButton from './start-button.svelte';
	import TaskbarSeparator from './taskbar-separator.svelte';

	interface Props {
		desktopSlice: DesktopSlice;
		taskbar?: Snippet;
		children?: Snippet;
		quickbar?: Snippet;
	}

	let { desktopSlice, taskbar, children, quickbar }: Props = $props();

	let debug$ = $derived(desktopSlice.desktop$.internals.debug$);
	let startButton: HTMLElement = $state()!;
</script>

<div id="taskbar" class="taskbar panel">
	<StartButton {desktopSlice} bind:startButton />
	<TaskbarSeparator />
	{@render taskbar?.()}
	<div id="taskbar-programs" class="taskbar-programs">
		{@render children?.()}
	</div>

	<div id="quickbar" class="quickbar panel inset">
		{@render quickbar?.()}
		{#if $debug$}
			<div class="quickbar-icon"><Image height={16} width={16} src={debugIcon} /></div>
		{/if}
		<Clock />
	</div>
</div>
