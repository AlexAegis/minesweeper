<script lang="ts">
	import closeIcon from '../assets/title-bar/w2k-title-bar-icon-close.png';
	import maximizeIcon from '../assets/title-bar/w2k-title-bar-icon-maximize.png';
	import minimizeIcon from '../assets/title-bar/w2k-title-bar-icon-minimize.png';
	import restoreIcon from '../assets/title-bar/w2k-title-bar-icon-restore.png';
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
	icon="{restoreIcon}"
	disabled="{!windowState.resizable || !windowState.active || windowState.maximized !== true}"
	on:click="{() => windowSlice.internals.maximized$.set('start-restoring')}"
>
	Restore
</Button>
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	icon="{minimizeIcon}"
	disabled="{!windowState.active || windowState.minimized !== false}"
	on:click="{() => windowSlice.internals.minimized$.set('start-minimizing')}"
>
	Minimize
</Button>
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	icon="{maximizeIcon}"
	disabled="{!windowState.resizable || !windowState.active || windowState.maximized !== false}"
	on:click="{() => windowSlice.internals.maximized$.set('start-maximizing')}"
>
	Maximize
</Button>
<hr />
<Button
	look="{ButtonLook.CONTEXT_MENU_ITEM}"
	bold="{true}"
	icon="{closeIcon}"
	on:click="{defer(() => desktopSlice.dicedWindows.remove(windowState.processId))}"
>
	Close
</Button>
