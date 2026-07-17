<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { afterNextPaint } from '../helpers/after-next-paint.function';
	import { readGlobal } from '../helpers/w2k-globals';
	import { formatPid, type DesktopSlice, type DicedWindow } from '../store/desktop.store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';
	import { getMinimizeAnimation } from './taskbar-animation';
	import TitleBar from './title-bar.svelte';
	import WindowContextItems from './window-context-items.svelte';
	import type { WindowState } from './window-state.interface';

	interface Props {
		desktopSlice: DesktopSlice;
		next: WindowState;
		windowSlice: DicedWindow;
	}

	let { desktopSlice, next, windowSlice }: Props = $props();
	let contextMenuPosition: CoordinateLike | undefined = $state(undefined);

	let forceAppearActive = $derived(!!contextMenuPosition);
</script>

<Button
	id={formatPid(next.processId, 'taskbar')}
	class={formatPid(next.processId)}
	look={ButtonLook.TASKBAR_ITEM}
	active={forceAppearActive ? true : next.active}
	icon={next.titleBarIcon}
	onclick={() => {
		if (next.active) {
			windowSlice.internals.minimized$.set('start-minimizing');
		} else {
			desktopSlice.desktop$.internals.actions.activateProgram.next(next.processId);
		}
	}}
	oncontextmenu={(event) => {
		contextMenuPosition = contextMenuPosition
			? undefined
			: { x: event.pageX / readGlobal('w2kZoom'), y: event.pageY / readGlobal('w2kZoom') };
	}}
>
	{next.title}

	<ContextMenu bind:position={contextMenuPosition}>
		<WindowContextItems windowState={next} {windowSlice} {desktopSlice} />
	</ContextMenu>
</Button>

{#if next.minimized === 'minimizing' || next.minimized === 'unminimizing'}
	<TitleBar
		windowState={{
			...next,
			showMaximize: false,
			showMinimize: false,
			showHelp: false,
			showClose: false,
		}}
		class="animate"
		style={getMinimizeAnimation(next, next.minimized)}
		onanimationend={(event) => {
			// The flight itself completes the transition; the store timer is
			// only a fallback for when this event never fires. The fill-mode
			// hold gets to paint the exact end pose before the bar unmounts.
			if (event.animationName.includes('animate-titlebar')) {
				const stage = next.minimized;
				afterNextPaint(() => {
					windowSlice.internals.minimized$.set(stage === 'minimizing');
				});
			}
		}}
	/>
{/if}
