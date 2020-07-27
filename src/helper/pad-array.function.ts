export function padArray<T>(array: T[], to: number, padding: T): T[] {
	while (array.length < to) {
		array.unshift(padding);
	}
	return array;
}
