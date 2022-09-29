import { BROWSER_ACTION_PREFIX, MINESWEEPER_ACTION_PREFIX, scope } from './scope';

export const tileClickAction$ = scope.createAction<[number, boolean]>(
	`${MINESWEEPER_ACTION_PREFIX} tileclick`
);
export const mouseUpAction$ = scope.createAction<void>(`${BROWSER_ACTION_PREFIX} mouse up`);
