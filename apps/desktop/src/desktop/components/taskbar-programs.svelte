<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { desktop$, dicedWindows, formatPid } from '../store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import { formatAnimationVariables, type TaskBarAnimationFrame } from './taskbar-animation';
	import TitleBar from './title-bar.svelte';
	import type { BaseWindowState } from './window-state.interface';

	const windowKeys$ = dicedWindows.keys$;

	const getMinimizeAnimation = (
		process: BaseWindowState,
		stage: 'minimizing' | 'unminimizing',
	): string | undefined => {
		const buttonId = formatPid(process.processId, 'taskbar');
		const windowId = formatPid(process.processId, 'window');

		const buttonElement = document.querySelector(`#${buttonId}`);
		const windowElement = document.querySelector(`#${windowId}`);
		const buttonParent = buttonElement?.parentElement;

		if (!buttonElement || !windowElement || !buttonParent) {
			return undefined;
		}

		const windowRect = windowElement.getBoundingClientRect();
		const buttonRect = buttonElement.getBoundingClientRect();
		const buttonParentRect = buttonParent.getBoundingClientRect();
		const buttonOffset: TaskBarAnimationFrame = {
			x: buttonRect.x - buttonParentRect.x,
			y: buttonRect.y - buttonParentRect.y,
			width: buttonElement.clientWidth,
		};
		const windowOffset: TaskBarAnimationFrame = {
			x: buttonOffset.x + windowRect.x - buttonRect.x,
			y: buttonOffset.y + windowRect.y - buttonRect.y,
			width: windowRect.width,
		};

		console.log(windowElement.clientWidth);
		const fromOffset = stage === 'minimizing' ? windowOffset : buttonOffset;
		const toOffset = stage === 'minimizing' ? buttonOffset : windowOffset;

		return formatAnimationVariables(fromOffset, toOffset);
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
				class="animate"
				style="{getMinimizeAnimation(next, next.minimized)}"
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
