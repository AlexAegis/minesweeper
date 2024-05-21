// managed-by-autotool

import eslintConfigCore from '@alexaegis/eslint-config-core';
import eslintConfigSvelte from '@alexaegis/eslint-config-svelte';
import eslintConfigVitest from '@alexaegis/eslint-config-vitest';

export default [...eslintConfigCore, ...eslintConfigSvelte, ...eslintConfigVitest];
