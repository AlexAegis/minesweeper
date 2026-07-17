/**
 * Executes a function on the next macrotick
 *
 * If a lint rule says you must await this put a `void` in front of it
 */
export const defer = (fn: () => unknown) => {
	return () => {
		setTimeout(fn, 0);
	};
};
