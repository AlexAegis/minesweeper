<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import MinesweeperMenu from '../components/minesweeper-menu.svelte';
	import Minesweeper from '../components/minesweeper.svelte';
	import { desktopActions, DesktopProgram, dicedWindows } from '../store';
	import Button from './button.svelte';
	import Window from './window.svelte';

	let keys$ = dicedWindows.keys$;

	const windowComponents: Record<DesktopProgram, any> = {
		[DesktopProgram.MINESWEEPER]: {
			menu: MinesweeperMenu,
			content: Minesweeper,
		},
	};
</script>

<div class="desktop">
	<div class="workspace">
		<slot />

		{#each $keys$ as processId (processId)}
			{@const window = dicedWindows.get(processId)}

			<Observer observable={window} let:next>
				<Window
					windowState={next}
					on:activate={() => desktopActions.activateProgram.next(processId)}
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
</div>
<div class="taskbar window">
	<Button>Start</Button>
	<div>
		<slot name="taskbar" />
	</div>
	<div class="quickbar">
		<slot name="quickbar" />
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
			margin-left: auto;
		}
	}
</style>
