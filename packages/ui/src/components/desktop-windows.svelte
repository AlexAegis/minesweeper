<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { formatPid, type DesktopSlice, type ProgramId } from '../store';
	import type { WindowComponents } from './window-state.interface';
	import Window from './window.svelte';

	export let desktopSlice: DesktopSlice;
	// TODO: Move this somewhere else
	export let windowComponents: Record<ProgramId, WindowComponents>;

	$: keys$ = desktopSlice.dicedWindows.keys$;
</script>

{#each $keys$ as processId (processId)}
	{@const windowSlice = desktopSlice.dicedWindows.get(processId)}

	{#if windowSlice.internals}
		<Observer observable="{windowSlice}" let:next>
			<Window
				id="{formatPid(next.processId, 'window')}"
				windowState="{next}"
				on:activate="{() => {
					desktopSlice.desktop$.internals.actions.activateProgram.next(processId);
				}}"
				on:maximize="{() => {
					windowSlice.internals.windowActions.maximize.next(undefined);
				}}"
				on:minimize="{() => {
					windowSlice.internals.minimized$.set('start-minimizing');
				}}"
				on:restore="{() => {
					windowSlice.internals.windowActions.restore.next(undefined);
				}}"
				on:close="{() => {
					desktopSlice.dicedWindows.remove(processId);
				}}"
				on:move="{(event) => {
					windowSlice.internals.windowActions.move.next(event.detail);
				}}"
				on:resize="{(event) => {
					windowSlice.internals.windowActions.resize.next(event.detail);
				}}"
			>
				<svelte:fragment slot="menu">
					{#if next.program && windowComponents[next.program]}
						<svelte:component
							this="{windowComponents[next.program]?.menu}"
							internals="{windowSlice.internals?.programLogic}"
							windowState="{next}"
							on:close="{() => {
								desktopSlice.dicedWindows.remove(processId);
							}}"
						/>
					{/if}
				</svelte:fragment>
				{#if next.program && windowSlice.internals?.programLogic && windowComponents[next.program]}
					<svelte:component
						this="{windowComponents[next.program]?.content}"
						internals="{windowSlice.internals.programLogic}"
					/>
				{/if}
			</Window>
		</Observer>
	{/if}
{/each}
