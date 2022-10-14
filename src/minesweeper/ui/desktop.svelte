<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import Minesweeper from '../components/minesweeper.svelte';
	import { DesktopProgram, dicedWindows } from '../store';
	import Button from './button.svelte';
	import Window from './window.svelte';

	let keys$ = dicedWindows.keys$;
</script>

<div class="desktop">
	<div class="workspace">
		<slot />

		{#each $keys$ as windowId (windowId)}
			{@const window = dicedWindows.get(windowId)}

			<Observer observable={window} let:next>
				<Window
					windowState={next}
					on:maximize={() => window.internals.windowActions.maximize.next(windowId)}
					on:minimize={() => window.internals.windowActions.minimize.next(windowId)}
					on:restore={() => window.internals.windowActions.restore.next(windowId)}
					on:close={() => dicedWindows.remove(windowId)}
					on:move={(event) => window.internals.windowActions.move.next(event.detail)}
				>
					{#if next.program === DesktopProgram.MINESWEEPER && window.internals.minesweeperGame}
						<Minesweeper internals={window.internals.minesweeperGame} />
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
