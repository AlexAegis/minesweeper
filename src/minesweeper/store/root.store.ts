import { fromEvent } from 'rxjs';
import { mouseUpAction$, tileClickAction$ } from './actions';
import { scope } from './scope';

export interface RootState {
	mouseDown: boolean;
}

export const rootSlice$ = scope.createRootSlice<RootState>(
	{
		mouseDown: false,
	},
	[
		tileClickAction$.reduce((state) => ({ ...state, mouseDown: true })),
		mouseUpAction$.reduce((state) => ({ ...state, mouseDown: false })),
	]
);

export const documentMouseUp$ = fromEvent(document, 'mouseup');
