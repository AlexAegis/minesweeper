import { defineConfig } from 'vite';

/**
 * The workspace root carries the vitest and `@vitest/coverage-v8` tooling used
 * to aggregate per-package coverage. It must depend on `vite` directly: without
 * an explicit root vite, the root vitest stack resolves the `vite@5` that
 * `vitepress` pulls in, and the per-package coverage runs then load that
 * `vite@5` (which lacks the `./module-runner` export vitest 4 needs) and crash.
 *
 * There is no root build or test task, so this config is not executed by the
 * turbo pipeline; it exists to pin the root on `vite@8` and to make the direct
 * `vite` dependency explicit for tooling such as depcheck.
 */
export default defineConfig({});
