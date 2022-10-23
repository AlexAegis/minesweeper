<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import MinesweeperMenu from '../minesweeper/components/minesweeper-menu.svelte';
	import Minesweeper from '../minesweeper/minesweeper.svelte';
	import Empty from './components/empty.svelte';
	import Shortcut from './components/shortcut.svelte';
	import Taskbar from './components/taskbar.svelte';
	import Window from './components/window.svelte';
	import {
		desktop$,
		dicedShortcuts,
		dicedWindows,
		ProgramName,
		snapShortcutPosition,
	} from './store';

	import './styles/desktop.scss';

	$: keys$ = dicedWindows.keys$;
	$: shortcutKeys$ = dicedShortcuts.keys$;

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
		{#each $shortcutKeys$ as shortcutKey}
			{@const shortcutSlice = dicedShortcuts.get(shortcutKey)}
			<Observer observable={shortcutSlice} let:next>
				<Shortcut
					shortcutState={next}
					on:drop={(event) =>
						shortcutSlice.internals.position$.set(snapShortcutPosition(event.detail))}
					on:dblclick={() => desktop$.internals.actions.spawnProgram.next(next.program)}
				/>
			</Observer>
		{/each}

		<slot />

		{#each $keys$ as processId (processId)}
			{@const windowSlice = dicedWindows.get(processId)}

			<Observer observable={windowSlice} let:next>
				<Window
					windowState={next}
					on:activate={() => desktop$.internals.actions.activateProgram.next(processId)}
					on:maximize={() => windowSlice.internals.windowActions.maximize.next(processId)}
					on:minimize={() => windowSlice.internals.windowActions.minimize.next(processId)}
					on:restore={() => windowSlice.internals.windowActions.restore.next(processId)}
					on:close={() => dicedWindows.remove(processId)}
					on:move={(event) => windowSlice.internals.windowActions.move.next(event.detail)}
					on:resize={(event) =>
						windowSlice.internals.windowActions.resize.next(event.detail)}
				>
					<svelte:fragment slot="menu">
						{#if next.program}
							<svelte:component
								this={windowComponents[next.program].menu}
								internals={windowSlice.internals.minesweeperGame}
								windowState={next}
							/>
						{/if}
					</svelte:fragment>
					{#if next.program}
						<svelte:component
							this={windowComponents[next.program].content}
							internals={windowSlice.internals.minesweeperGame}
						/>
					{/if}
				</Window>
			</Observer>
		{/each}
	</div>
	<Taskbar />
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
</style>
