<script lang="ts">
	import Observer from 'svelte-rxjs-observer/src/observer.svelte';
	import Minesweeper from '../components/minesweeper.svelte';
	import { desktopActions, DesktopProgram, programIds$, windowWithInternals } from '../store';
	import Window from './window.svelte';
</script>

<div class="desktop">
	<div class="workspace">
		<slot />

		{#each $programIds$ as programId}
			{@const windowWithInternals$ = windowWithInternals(programId)}
			<Observer observable={windowWithInternals$} let:next>
				<Window
					windowState={next.window}
					on:maximize={() => desktopActions.maximize.next(programId)}
					on:minimize={() => desktopActions.minimize.next(programId)}
					on:restore={() => desktopActions.restore.next(programId)}
					on:close={() => desktopActions.close.next(programId)}
					on:move={(event) => desktopActions.move.next({ programId, to: event.detail })}
				>
					{#if next.window.program === DesktopProgram.MINESWEEPER}
						<Minesweeper internals={next.internals} />
					{/if}
				</Window>
			</Observer>
		{/each}
	</div>
</div>
<div class="taskbar window">
	<slot name="taskbar" />
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
		--taskbar-height: 26px;
		height: var(--taskbar-height);

		position: fixed;

		bottom: 0px;
		width: calc(100% - 6px);
	}
</style>
