<script lang="ts">
	import type { CoordinateLike } from '@alexaegis/desktop-common';
	import { Observer } from 'svelte-rxjs-observer';
	import { desktop$, dicedWindows, formatPid } from '../store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import TitleBar from './title-bar.svelte';
	import type { BaseWindowState } from './window-state.interface';

	const windowKeys$ = dicedWindows.keys$;

	const formatAnimationVariables = (
		buttonPosition: CoordinateLike,
		windowPosition: CoordinateLike,
		buttonWidth: number,
		windowWidth: number,
	): string =>
		`--button-x: ${buttonPosition.x}px; --button-y: ${buttonPosition.y}px; --window-x: ${windowPosition.x}px; --window-y: ${windowPosition.y}px; --button-width: ${buttonWidth}px; --window-width: ${windowWidth}px;`;

	const getMinimizeAnimation = (process: BaseWindowState): string | undefined => {
		const buttonId = formatPid(process.processId, 'taskbar');
		const windowId = formatPid(process.processId, 'window');

		const buttonElement = document.querySelector(`#${buttonId}`);
		const windowElement = document.querySelector(`#${windowId}`);
		const buttonParent = buttonElement?.parentElement;

		if (!buttonElement || !windowElement || !buttonParent) {
			return undefined;
		}

		const buttonRect = buttonElement.getBoundingClientRect();
		const buttonParentRect = buttonParent.getBoundingClientRect();
		const buttonOffset: CoordinateLike = {
			x: buttonRect.x - buttonParentRect.x,
			y: buttonRect.y - buttonParentRect.y,
		};
		const windowOffset: CoordinateLike = {
			x: buttonOffset.x + process.position.x - buttonRect.x,
			y: buttonOffset.y + process.position.y - buttonRect.y,
		};
		return formatAnimationVariables(
			buttonOffset,
			windowOffset,
			buttonElement.clientWidth,
			windowElement.clientWidth,
		);
	};
</script>

{#each $windowKeys$ as windowKey}
	{@const windowSlice = dicedWindows.get(windowKey)}
	<Observer observable="{windowSlice}" let:next>
		<Button
			id="{formatPid(next.processId, 'taskbar')}"
			class="{formatPid(next.processId)}"
			look="{ButtonLook.TASKBAR_ITEM}"
			active="{next.active}"
			icon="{next.titleBarIcon}"
			on:click="{() => {
				if (next.active) {
					windowSlice.internals.minimized$.set('start-minimizing');
				} else {
					desktop$.internals.actions.activateProgram.next(next.processId);
				}
			}}">{next.title}</Button
		>

		{#if next.minimized === 'minimizing' || next.minimized === 'unminimizing'}
			<TitleBar
				class="{'animate-' + next.minimized}"
				style="{getMinimizeAnimation(next)}"
				title="{next.title}"
				icon="{next.titleBarIcon}"
				showMaximize="{false}"
				showMinimize="{false}"
				showHelp="{false}"
				showClose="{false}"
			/>
		{/if}
	</Observer>
{/each}
