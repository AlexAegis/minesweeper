import { describe, expect, it } from 'vitest';
import { capitalize } from './capitalize.function.js';

describe('capitalize', () => {
	it('should capitalize the first letter of a string', () => {
		expect(capitalize('foo')).toBe('Foo');
	});

	it('should return an empty string for an empty string', () => {
		expect(capitalize('')).toBe('');
	});
});
