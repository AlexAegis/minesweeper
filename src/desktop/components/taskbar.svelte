<script lang="ts">
	import { debug$ } from '../../root.store';
	import { startMenuOpen$ } from '../store';
	import Button from './button.svelte';
	import Clock from './clock.svelte';
	import StartMenu from './start-menu.svelte';

	import Image from './image.svelte';

	import flagIcon from '../../assets/minesweeper/flag.png';

	let startButton: HTMLElement;
</script>

{#if $startMenuOpen$}
	<StartMenu {startButton} />
{/if}

<div class="taskbar window">
	<Button
		bind:button={startButton}
		class="start"
		on:fire={() => startMenuOpen$.set(!startMenuOpen$.value)}
	>
		<div class="start-logo" />
		Start
	</Button>
	<div>
		<slot name="taskbar" />
	</div>
	<div class="quickbar">
		<slot name="quickbar" />
		{#if $debug$}
			<Image height={10} width={10} src={flagIcon} />
		{/if}
		<Clock />
	</div>
</div>

<style lang="scss">
	.taskbar {
		display: flex;
		justify-content: space-between;

		--taskbar-height: 26px;
		height: var(--taskbar-height);

		position: fixed;

		bottom: 0px;
		width: calc(100% - 6px);

		.quickbar {
			display: flex;
			gap: 4px;
			align-items: center;
			margin-left: auto;
			border: 1px inset;
			padding: 0 4px 0 4px;
		}

		:global(.start) {
			padding: 0;
			min-width: 64px;
			padding: 8px;
		}

		.start-logo {
			width: 16px;
			height: 14px;
			image-rendering: pixelated;
			background-image: var(--asset-start);
		}
	}
</style>
