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
		from: CoordinateLike,
		to: CoordinateLike,
		fromWidth: number,
		toWidth: number,
	): string =>
		`--minimize-from-x: ${from.x}px; --minimize-from-y: ${from.y}px; --minimize-to-x: ${to.x}px; --minimize-to-y: ${to.y}px; --from-width: ${fromWidth}px; --to-width: ${toWidth}px;`;

	const getMinimizeAnimation = (
		process: BaseWindowState,
		direction: 'minimizing' | 'unminimizing',
	): string => {
		const buttonId = formatPid(process.processId, 'taskbar');
		const windowId = formatPid(process.processId, 'window');

		const buttonElement = document.querySelector(`#${buttonId}`);
		const windowElement = document.querySelector(`#${windowId}`);
		const buttonParent = buttonElement?.parentElement;

		if (buttonElement && windowElement && buttonParent) {
			const buttonRect = buttonElement.getBoundingClientRect();
			const buttonParentRect = buttonParent.getBoundingClientRect();
			const offset: CoordinateLike = {
				x: buttonRect.x - buttonParentRect.x,
				y: buttonRect.y - buttonParentRect.y,
			};
			return direction === 'minimizing'
				? formatAnimationVariables(
						{
							x: offset.x + process.position.x - buttonRect.x,
							y: offset.y + process.position.y - buttonRect.y,
						},
						offset,
						windowElement.clientWidth,
						buttonElement.clientWidth,
				  )
				: formatAnimationVariables(
						offset,
						{
							x: offset.x + process.position.x - buttonRect.x,
							y: offset.y + process.position.y - buttonRect.y,
						},
						buttonElement.clientWidth,
						windowElement.clientWidth,
				  );
		} else {
			return '';
		}
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
				class="floating"
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
