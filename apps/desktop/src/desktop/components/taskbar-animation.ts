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
