<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { DesktopSlice } from '../store/desktop.store';
	import TaskbarProgram from './taskbar-program.svelte';

	export let desktopSlice: DesktopSlice;

	$: windowKeys$ = desktopSlice.dicedWindows.keys$;
</script>

{#each $windowKeys$ as windowKey}
	{@const windowSlice = desktopSlice.dicedWindows.get(windowKey)}
	<Observer observable="{windowSlice}" let:next>
		<TaskbarProgram {next} {windowSlice} {desktopSlice} />
	</Observer>
{/each}
