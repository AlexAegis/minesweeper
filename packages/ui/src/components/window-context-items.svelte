<script lang="ts">
	import {
		w2kTaskbarCloseIcon,
		w2kTaskbarMaximizeIcon,
		w2kTaskbarMinimizeIcon,
		w2kTaskbarRestoreIcon,
	} from '../assets/task-bar/index';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import type { WindowState } from './window-state.interface';

	import { defer } from '@w2k/common';
	import type { DesktopSlice, DicedWindow } from '../store/desktop.store';

	interface Props {
		windowState: WindowState;
		windowSlice: DicedWindow;
		desktopSlice: DesktopSlice;
	}

	let { windowState, windowSlice, desktopSlice }: Props = $props();
</script>

<Button
	look={ButtonLook.CONTEXT_MENU_ITEM}
	icon={w2kTaskbarRestoreIcon}
	disabled={!windowState.resizable || !windowState.active || windowState.maximized !== true}
	onclick={() => windowSlice.internals.maximized$.set('start-restoring')}
>
	Restore
</Button>
<Button
	look={ButtonLook.CONTEXT_MENU_ITEM}
	disabled={windowState.maximized !== false || windowState.minimized !== false}
	title="Resets the position of the window"
	onclick={() => windowSlice.internals.position$.set({ x: 10, y: 10 })}
>
	Move
</Button>
<Button look={ButtonLook.CONTEXT_MENU_ITEM} disabled={true} title="Not implemented">Size</Button>
<Button
	look={ButtonLook.CONTEXT_MENU_ITEM}
	icon={w2kTaskbarMinimizeIcon}
	disabled={!windowState.active || windowState.minimized !== false}
	onclick={() => windowSlice.internals.minimized$.set('start-minimizing')}
>
	Minimize
</Button>
<Button
	look={ButtonLook.CONTEXT_MENU_ITEM}
	icon={w2kTaskbarMaximizeIcon}
	disabled={!windowState.resizable || !windowState.active || windowState.maximized !== false}
	onclick={() => windowSlice.internals.maximized$.set('start-maximizing')}
>
	Maximize
</Button>
<hr />
<Button
	look={ButtonLook.CONTEXT_MENU_ITEM}
	bold={true}
	icon={w2kTaskbarCloseIcon}
	onclick={defer(() => desktopSlice.dicedWindows.remove(windowState.processId))}
>
	Close
</Button>
