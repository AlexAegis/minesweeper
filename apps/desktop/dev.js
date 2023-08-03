// managed-by-autotool

import { turbowatchLocalNodeModules } from '@alexaegis/turbowatch';
import { watch } from 'turbowatch';

void (async () => {
	await watch(
		await turbowatchLocalNodeModules({
			buildDependenciesScript: 'build:dependencies',
			devScript: 'dev_',
		}),
	);
})();
