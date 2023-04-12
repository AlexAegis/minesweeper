import { render, type RenderResult } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './app.svelte';

describe('app', () => {
	let instance: RenderResult<App>;

	beforeEach(() => {
		instance = render(App);
	});

	it('should be able to render', () => {
		expect(instance.component).toBeTruthy();
	});
});
