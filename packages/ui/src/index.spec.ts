import { describe, expect, it } from 'vitest';
import * as index from './index.js';

describe('index', () => {
	it('should be defined', () => {
		expect(index).toBeDefined();
		expect(Object.values(index).length > 0).toBeTruthy();
	});
});
