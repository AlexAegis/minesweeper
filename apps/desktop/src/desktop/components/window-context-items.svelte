<script lang="ts">
	import closeIcon from '../../assets/desktop/title-bar-icon-close.png';
	import maximizeIcon from '../../assets/desktop/title-bar-icon-maximize.png';
	import minimizeIcon from '../../assets/desktop/title-bar-icon-minimize.png';
	import restoreIcon from '../../assets/desktop/title-bar-icon-restore.png';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import type { WindowState } from './window-state.interface';

	import type { DicedWindow, DicedWindows } from '../store/desktop.store';
	import { defer } from './defer';

	export let windowState: WindowState;

	export let windowSlice: DicedWindow;
	export let dicedWindows: DicedWindows;
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
	on:click="{defer(() => dicedWindows.remove(windowState.processId))}"
>
	Close
</Button>
