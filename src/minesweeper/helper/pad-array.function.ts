export function padArray<T>(array: T[], until: number, padding: T): T[] {
	while (array.length < until) {
		array.unshift(padding);
	}
	return array;
}
