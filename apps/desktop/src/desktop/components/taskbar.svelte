<script lang="ts">
	import { debug$ } from '../../root.store';
	import { activeSchemeKind$, startMenuOpen$ } from '../store';
	import Button from './button.svelte';
	import Clock from './clock.svelte';
	import StartMenu from './start-menu.svelte';

	import Image from './image.svelte';

	import w2kStartIcon from '../../assets/desktop/w2k-start.png';
	import w98StartIcon from '../../assets/desktop/w98-start.png';

	import { map } from 'rxjs';
	import flagIcon from '../../assets/minesweeper/flag.png';
	import TaskbarSeparator from './taskbar-separator.svelte';

	let startButton: HTMLElement;

	const startIcon$ = activeSchemeKind$.pipe(
		map((kind) => (kind === 'w2k' ? w2kStartIcon : w98StartIcon)),
	);
</script>

{#if $startMenuOpen$}
	<StartMenu {startButton} />
{/if}

<div class="taskbar panel">
	<Button
		bind:button="{startButton}"
		class="start"
		on:fire="{() => {
			startMenuOpen$.set(!startMenuOpen$.value);
		}}"
	>
		<Image height="{14}" src="{$startIcon$}" />
	</Button>

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
			padding: 0 4px;
			height: 22px;
		}

		:global(.start) {
		//	height: 22px;
			min-height: 22px;
			min-width: 0;
			padding: 4px;
		}
	}
</style>
