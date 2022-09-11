import { Scope } from '@tinyslice/core';

const scope = Scope.createScope();
const printAction = scope.createAction<string>('printAction');

export interface ExampleState {
	lastPrinted: string | undefined;
	count: number;
}

export const store$ = scope.createStore<ExampleState>(
	{
		lastPrinted: undefined,
		count: 0,
	},
	[
		printAction.reduce((state, payload) => ({ ...state, lastPrinted: payload })),
		// countAction.reduce((state, payload) => ({ ...state, count: state.count + payload })),
	]
);
