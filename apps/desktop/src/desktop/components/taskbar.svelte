<script lang="ts">
	import { debug$ } from '../../root.store';
	import { startMenuOpen$ } from '../store';
	import Clock from './clock.svelte';

	import Image from './image.svelte';

	import flagIcon from '../../assets/minesweeper/flag.png';
	import StartButton from './start-button.svelte';
	import StartMenu from './start-menu.svelte';
	import TaskbarSeparator from './taskbar-separator.svelte';

	let startButton: HTMLElement;
</script>

{#if $startMenuOpen$}
	<StartMenu {startButton} />
{/if}

<div class="taskbar panel">
	<StartButton bind:startButton />
	<TaskbarSeparator />
	<slot name="taskbar" />

	<div class="quickbar panel inset">
		<slot name="quickbar" />
		{#if $debug$}
			<Image height="{10}" width="{10}" src="{flagIcon}" />
		{/if}
		<Clock />
	</div>
</div>

<style lang="scss">
	.taskbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 2px 2px;
		height: var(--win-taskbar-height);
		position: fixed;
		bottom: 0;
		width: 100%;
		box-sizing: border-box;
		box-shadow:
			inset 0 1px var(--win-3d-objects-color),
			inset 0 2px var(--win-3d-objects-color-lighter-1);

		.quickbar {
			display: flex;
			gap: 4px;
			align-items: center;
			margin-left: auto;
			padding: 0 3px;
			height: 22px;
		}

		:global(.start) {
			min-height: 22px;
			min-width: 0;
			padding: 4px;
		}
	}
</style>
