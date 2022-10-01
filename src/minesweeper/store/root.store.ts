import { TinySliceDevtoolPlugin } from '@tinyslice/devtools-plugin';
import packageJson from '../../../package.json';
import { scope } from './scope';

export interface RootState {
	hey: boolean;
}

export const rootSlice$ = scope.createRootSlice<RootState>(
	{
		hey: false,
	},
	[],
	{
		plugins: [
			new TinySliceDevtoolPlugin({
				name: `${packageJson.displayName} (${packageJson.version})`,
			}),
		],
		metaReducers: [],
		useDefaultLogger: true,
	}
);
