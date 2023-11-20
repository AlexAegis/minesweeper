<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { GrippyContainer } from '../helpers/grippy/grippy';
	import { formatPid, type DesktopSlice, type ProgramId } from '../store';
	import WindowContextItems from './window-context-items.svelte';
	import type { WindowComponents } from './window-state.interface';
	import Window from './window.svelte';

	export let grippy: GrippyContainer;
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
				{grippy}
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
				<svelte:fragment slot="title-bar-context-menu">
					<WindowContextItems windowState="{next}" {windowSlice} {desktopSlice} />
				</svelte:fragment>
				{#if next.program && windowComponents[next.program]?.menu}
					<div class="menu-bar">
						<svelte:component
							this="{windowComponents[next.program]?.menu}"
							slot="menu"
							internals="{windowSlice.internals?.programLogic}"
							windowState="{next}"
							on:close="{() => desktopSlice.dicedWindows.remove(processId)}"
						/>
					</div>
				{/if}

				{#if next.program && windowSlice.internals?.programLogic && windowComponents[next.program]}
					<svelte:component
						this="{windowComponents[next.program]?.content}"
						windowState="{next}"
						{windowSlice}
						{desktopSlice}
						internals="{windowSlice.internals.programLogic}"
					/>
				{/if}
			</Window>
		</Observer>
	{/if}
{/each}

<style>
	.menu-bar {
		display: flex;
	}
</style>
