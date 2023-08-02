<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { dicedWindows } from '../store';
	import TaskbarProgram from './taskbar-program.svelte';

	const windowKeys$ = dicedWindows.keys$;
</script>

{#each $windowKeys$ as windowKey}
	{@const windowSlice = dicedWindows.get(windowKey)}
	<Observer observable="{windowSlice}" let:next>
		<TaskbarProgram {next} {windowSlice} />
	</Observer>
{/each}
