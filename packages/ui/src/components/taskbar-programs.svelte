<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { DesktopSlice } from '../store/desktop.store';
	import TaskbarProgram from './taskbar-program.svelte';
	import type { WindowState } from './window-state.interface';

	interface Props {
		desktopSlice: DesktopSlice;
	}

	let { desktopSlice }: Props = $props();

	let windowKeys$ = $derived(desktopSlice.dicedWindows.keys$);
</script>

{#each $windowKeys$ as windowKey}
	{@const windowSlice = desktopSlice.dicedWindows.get(windowKey)}
	<Observer observable={windowSlice}>
		{#snippet children({ next }: { next: WindowState })}
			<TaskbarProgram {next} {windowSlice} {desktopSlice} />
		{/snippet}
	</Observer>
{/each}
