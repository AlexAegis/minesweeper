import { Slice } from '@tinyslice/core';

import type { BaseWindowState, WindowState } from '@w2k/ui';

export const DISPLAY_PROPERTIES_TAG = '[display-properties]';

export type DisplayPropertiesApp = ReturnType<typeof createDesktopProperties>;

export const createDesktopProperties = (
	parentSlice: Slice<Record<string, WindowState>, BaseWindowState>,
	key: string,
) => {
	const game$ = parentSlice.addSlice(
		key,
		{
			cheating: false,
		},
		{
			defineInternals: () => {
				return 1;
			},
		},
	);

	const cheating$ = game$.slice('cheating');

	const minesweeperActions = {
		cheating: cheating$.setAction,
	};

	return {
		minesweeperActions,
		game$,
		cheating$,
		programSlice: game$,
	};
};
