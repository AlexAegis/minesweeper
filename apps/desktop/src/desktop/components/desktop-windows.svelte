<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import MinesweeperMenu from '../../minesweeper/components/minesweeper-menu.svelte';
	import Minesweeper from '../../minesweeper/minesweeper.svelte';
	import { desktop$, dicedWindows, ProgramName } from '../store';
	import Empty from './empty.svelte';
	import Window from './window.svelte';

	$: keys$ = dicedWindows.keys$;

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

{#each $keys$ as processId (processId)}
	{@const windowSlice = dicedWindows.get(processId)}

	<Observer observable="{windowSlice}" let:next>
		<Window
			windowState="{next}"
			on:activate="{() => {
				desktop$.internals.actions.activateProgram.next(processId);
			}}"
			on:maximize="{() => {
				windowSlice.internals.windowActions.maximize.next(processId);
			}}"
			on:minimize="{() => {
				windowSlice.internals.windowActions.minimize.next(processId);
			}}"
			on:restore="{() => {
				windowSlice.internals.windowActions.restore.next(processId);
			}}"
			on:close="{() => {
				dicedWindows.remove(processId);
			}}"
			on:move="{(event) => {
				windowSlice.internals.windowActions.move.next(event.detail);
			}}"
			on:resize="{(event) => {
				windowSlice.internals.windowActions.resize.next(event.detail);
			}}"
		>
			<svelte:fragment slot="menu">
				{#if next.program}
					<svelte:component
						this="{windowComponents[next.program].menu}"
						internals="{windowSlice.internals.minesweeperGame}"
						windowState="{next}"
					/>
				{/if}
			</svelte:fragment>
			{#if next.program}
				<svelte:component
					this="{windowComponents[next.program].content}"
					internals="{windowSlice.internals.minesweeperGame}"
				/>
			{/if}
		</Window>
	</Observer>
{/each}
