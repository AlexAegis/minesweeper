import { readGlobal } from '../helpers/w2k-globals';
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
	const titleBarElement = document.querySelector(`#${windowId} .title-bar`);

	if (!buttonElement || !titleBarElement) {
		return undefined;
	}

	// Rects are in screen pixels, but the animated title bar is positioned
	// inside the zoomed desktop where its fixed-position left/top are in
	// local pixels relative to the viewport.
	const zoom = readGlobal('w2kZoom') || 1;
	const titleBarRect = titleBarElement.getBoundingClientRect();
	const buttonRect = buttonElement.getBoundingClientRect();
	const buttonOffset: TaskBarAnimationFrame = {
		x: buttonRect.x / zoom,
		y: buttonRect.y / zoom,
		width: buttonRect.width / zoom,
	};
	const windowOffset: TaskBarAnimationFrame = {
		x: titleBarRect.x / zoom,
		y: titleBarRect.y / zoom,
		width: titleBarRect.width / zoom,
	};

	const fromOffset = stage === 'minimizing' ? windowOffset : buttonOffset;
	const toOffset = stage === 'minimizing' ? buttonOffset : windowOffset;

	return formatAnimationVariables(fromOffset, toOffset);
};
