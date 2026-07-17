<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import type { GrippyContainer } from '../helpers/grippy/grippy';
	import { formatPid, type DesktopSlice, type ProgramId } from '../store';
	import WindowContextItems from './window-context-items.svelte';
	import type { WindowComponents, WindowState } from './window-state.interface';
	import Window from './window.svelte';

	interface Props {
		grippy: GrippyContainer;
		desktopSlice: DesktopSlice;
		// TODO: Move this somewhere else
		windowComponents: Record<ProgramId, WindowComponents>;
	}

	let { grippy, desktopSlice, windowComponents }: Props = $props();

	let keys$ = $derived(desktopSlice.dicedWindows.keys$);
</script>

{#each $keys$ as processId (processId)}
	{@const windowSlice = desktopSlice.dicedWindows.get(processId)}

	{#if windowSlice.internals}
		<Observer observable={windowSlice}>
			{#snippet children({ next }: { next: WindowState })}
				<Window
					id={formatPid(next.processId, 'window')}
					windowState={next}
					{grippy}
					onActivate={() => {
						desktopSlice.desktop$.internals.actions.activateProgram.next(processId);
					}}
					onMaximize={() => {
						windowSlice.internals.windowActions.maximize.next(undefined);
					}}
					onMinimize={() => {
						windowSlice.internals.minimized$.set('start-minimizing');
					}}
					onRestore={() => {
						windowSlice.internals.windowActions.restore.next(undefined);
					}}
					onClose={() => {
						desktopSlice.dicedWindows.remove(processId);
					}}
					onMove={(delta) => {
						windowSlice.internals.windowActions.move.next(delta);
					}}
					onResize={(rectangle) => {
						windowSlice.internals.windowActions.resize.next(rectangle);
					}}
					onMaximizeAnimationEnd={(stage) => {
						windowSlice.internals.maximized$.set(stage === 'maximizing');
					}}
				>
					{#snippet titleBarContextMenu()}
						<WindowContextItems windowState={next} {windowSlice} {desktopSlice} />
					{/snippet}

					{#snippet menu()}
						{#if next.program && windowComponents[next.program]?.menu}
							{@const MenuComponent = windowComponents[next.program]?.menu}
							<div class="menu-bar">
								<MenuComponent
									internals={windowSlice.internals?.programLogic}
									windowState={next}
								/>
							</div>
						{/if}
					{/snippet}

					{#if next.program && windowSlice.internals?.programLogic && windowComponents[next.program]}
						{@const ContentComponent = windowComponents[next.program]?.content}
						<ContentComponent
							windowState={next}
							{windowSlice}
							{desktopSlice}
							internals={windowSlice.internals.programLogic}
						/>
					{/if}
				</Window>
			{/snippet}
		</Observer>
	{/if}
{/each}

<style>
	.menu-bar {
		display: flex;
	}
</style>
