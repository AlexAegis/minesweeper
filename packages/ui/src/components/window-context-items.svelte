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

	export let windowState: WindowState;
	export let windowSlice: DicedWindow;
	export let desktopSlice: DesktopSlice;
</script>

<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	icon="{w2kTaskbarRestoreIcon}"
	disabled="{!windowState.resizable || !windowState.active || windowState.maximized !== true}"
	on:click="{() => windowSlice.internals.maximized$.set('start-restoring')}"
>
	Restore
</Button>
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	disabled="{windowState.maximized !== false || windowState.minimized !== false}"
	title="Resets the position of the window"
	on:click="{() => windowSlice.internals.position$.set({ x: 10, y: 10 })}"
>
	Move
</Button>
<Button look="{ButtonLook.CONTEXT_MENU_ITEM}" disabled="{true}" title="Not implemented">
	Size
</Button>
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	icon="{w2kTaskbarMinimizeIcon}"
	disabled="{!windowState.active || windowState.minimized !== false}"
	on:click="{() => windowSlice.internals.minimized$.set('start-minimizing')}"
>
	Minimize
</Button>
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	icon="{w2kTaskbarMaximizeIcon}"
	disabled="{!windowState.resizable || !windowState.active || windowState.maximized !== false}"
	on:click="{() => windowSlice.internals.maximized$.set('start-maximizing')}"
>
	Maximize
</Button>
<hr />
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	bold="{true}"
	icon="{w2kTaskbarCloseIcon}"
	on:click="{defer(() => desktopSlice.dicedWindows.remove(windowState.processId))}"
>
	Close
</Button>
