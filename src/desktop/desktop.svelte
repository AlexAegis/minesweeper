<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import MinesweeperMenu from '../minesweeper/components/minesweeper-menu.svelte';
	import Minesweeper from '../minesweeper/minesweeper.svelte';
	import { debug$ } from '../root.store';
	import Button from './components/button.svelte';
	import Clock from './components/clock.svelte';
	import DesktopIcon from './components/desktop-icon.svelte';
	import Empty from './components/empty.svelte';
	import StartMenu from './components/start-menu.svelte';
	import Window from './components/window.svelte';
	import {
		desktopActions,
		dicedPrograms,
		dicedWindows,
		ProgramName,
		startMenuOpen$,
	} from './store';

	import Image from './components/image.svelte';
	import './styles/desktop.scss';

	import flagIcon from '../assets/minesweeper/flag.png';

	let startButton: HTMLElement;

	$: keys$ = dicedWindows.keys$;
	$: programKeys$ = dicedPrograms.keys$;
	interface WindowComponents {
		menu: ComponentType;
		content: ComponentType;
	}

	const windowComponents: Record<ProgramName, WindowComponents> = {
		[ProgramName.MINESWEEPER]: {
			menu: MinesweeperMenu,
			content: Minesweeper,
		},
		[ProgramName.UNKNOWN]: {
			menu: Empty,
			content: Empty,
		},
	};
</script>

<div class="desktop">
	<div class="workspace">
		{#each $programKeys$ as programKey}
			<Observer observable={dicedPrograms.get(programKey)} let:next>
				<DesktopIcon
					title={next.title}
					icon={next.icon}
					on:dblclick={() => desktopActions.spawnProgram.next(programKey)}
				/>
			</Observer>
		{/each}

		<slot />

		{#each $keys$ as processId (processId)}
			{@const window = dicedWindows.get(processId)}

			<Observer observable={window} let:next>
				<Window
					windowState={next}
					on:active={(event) => window.internals.active$.set(event.detail)}
					on:maximize={() => window.internals.windowActions.maximize.next(processId)}
					on:minimize={() => window.internals.windowActions.minimize.next(processId)}
					on:restore={() => window.internals.windowActions.restore.next(processId)}
					on:close={() => dicedWindows.remove(processId)}
					on:move={(event) => window.internals.windowActions.move.next(event.detail)}
					on:resize={(event) => window.internals.windowActions.resize.next(event.detail)}
				>
					<svelte:fragment slot="menu">
						{#if next.program}
							<svelte:component
								this={windowComponents[next.program].menu}
								internals={window.internals.minesweeperGame}
								windowState={next}
							/>
						{/if}
					</svelte:fragment>
					{#if next.program}
						<svelte:component
							this={windowComponents[next.program].content}
							internals={window.internals.minesweeperGame}
						/>
					{/if}
				</Window>
			</Observer>
		{/each}
	</div>

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
</div>

<style lang="scss">
	.desktop {
		overscroll-behavior: none;

		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		height: calc(100% - 32px);

		.workspace {
			height: 100%;
			width: 100%;
		}
	}

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
