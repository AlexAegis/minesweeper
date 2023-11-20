<script lang="ts">
	import {
		Button,
		ButtonLook,
		Window,
		desktopColorSchemeToCssVariables,
		joinStyleMap,
		type DesktopColorScheme,
	} from '@w2k/ui';

	export let desktopColorScheme: DesktopColorScheme;
</script>

<div
	class="appearance-preview custom-scheme w2k"
	style="{joinStyleMap(desktopColorSchemeToCssVariables(desktopColorScheme))}"
>
	<Window
		transient="{false}"
		style="position: absolute;"
		windowState="{{
			active: false,
			height: 69,
			width: 213,
			position: { x: 10, y: 10 },
			title: 'Inactive Window',
			showMaximize: true,
			showMinimize: true,
		}}"
	></Window>
	<Window
		transient="{false}"
		style="position: absolute;"
		windowState="{{
			active: true,
			height: 133,
			width: 335,
			position: { x: 14, y: 33 },
			title: 'Active Window',
			showMaximize: true,
			showMinimize: true,
		}}"
	>
		<div class="menu-bar" slot="menu">
			<Button look="{ButtonLook.TITLE_BAR_MENU_ITEM}">Normal</Button>
			<Button look="{ButtonLook.TITLE_BAR_MENU_ITEM}" disabled appearDisabled="{true}"
				>Disabled</Button
			>
			<Button look="{ButtonLook.TITLE_BAR_MENU_ITEM}" pressed="{true}">Selected</Button>
		</div>
		<div class="example-active-window-content">
			<textarea></textarea>
		</div>
	</Window>
	<Window
		transient="{false}"
		style="position: absolute;"
		windowState="{{
			active: true,
			height: 69,
			width: 213,
			position: { x: 20, y: 116 },
			title: 'Message Box',
			showMaximize: false,
			showMinimize: false,
		}}"
	>
		<div class="example-message-box-window-content">
			<span>Message Box</span>
			<Button>OK</Button>
		</div>
	</Window>
</div>

<style lang="scss">
	.appearance-preview {
		display: block;
		position: relative;
		overflow: hidden;
		top: 0;
		left: 0;

		> * {
			grid-row: 1;
			grid-column: 1;
			pointer-events: all;
		}

		width: 355px;
		height: 193px;
		background-color: var(--win-desktop-color);
		box-shadow:
			inset -1px -1px var(--win-3d-objects-color-lighter-2),
			inset 1px 1px var(--win-3d-objects-color-darker-1),
			inset -2px -2px var(--win-3d-objects-color),
			inset 2px 2px var(--win-shadow-color);
	}

	.example-message-box-window-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		justify-content: space-evenly;
		padding-left: 4px;

		span {
			align-self: flex-start;
		}
	}

	.example-active-window-content {
		height: 100%;

		textarea {
			resize: none;
			width: 100%;
			height: calc(100% - 3px);
			overflow-y: scroll;
		}
	}
</style>
