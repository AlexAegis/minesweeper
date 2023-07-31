<script lang="ts">
	import { debug$ } from '../../root.store';
	// import { startMenuOpen$ } from '../store';
	import Clock from './clock.svelte';

	import Image from './image.svelte';

	import flagIcon from '../../assets/minesweeper/flag.png';
	import StartButton from './start-button.svelte';
	import TaskbarSeparator from './taskbar-separator.svelte';

	let startButton: HTMLElement;
</script>

<div id="taskbar" class="taskbar panel">
	<StartButton bind:startButton />
	<TaskbarSeparator />
	<slot name="taskbar" />
	<div id="taskbar-programs" class="taskbar-programs">
		<slot />
	</div>

	<div id="quickbar" class="quickbar panel inset">
		<slot name="quickbar" />
		{#if $debug$}
			<div class="quickbar-icon"><Image height="{10}" width="{10}" src="{flagIcon}" /></div>
		{/if}
		<Clock />
	</div>
</div>
