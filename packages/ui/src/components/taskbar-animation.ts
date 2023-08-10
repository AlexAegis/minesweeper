import { formatPid } from '../store/desktop.store';
import type { BaseWindowState } from './window-state.interface';

export interface TaskBarAnimationFrame {
	x: number;
	y: number;
	width: number;
}

export const formatAnimationVariables = (
	from: TaskBarAnimationFrame,
	to: TaskBarAnimationFrame,
): string =>
	`--titlebar-from-x: ${from.x}px; \
--titlebar-from-y: ${from.y}px; \
--titlebar-from-width: ${from.width}px; \
--titlebar-to-x: ${to.x}px; \
--titlebar-to-y: ${to.y}px; \
--titlebar-to-width: ${to.width}px;`;

export const getMinimizeAnimation = (
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

	const fromOffset = stage === 'minimizing' ? windowOffset : buttonOffset;
	const toOffset = stage === 'minimizing' ? buttonOffset : windowOffset;

	return formatAnimationVariables(fromOffset, toOffset);
};
