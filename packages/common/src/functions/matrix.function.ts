export const makeMatrix = <T>(x: number, y = 0, initial?: (x: number, y: number) => T): T[][] => {
	const matrix: T[][] = [];
	for (let i = 0; i < x; i++) {
		const row = new Array<T>(y);
		if (initial) {
			for (let j = 0; j < y; j++) {
				row[j] = initial(i, j);
			}
		}
		matrix.push(row);
	}
	return matrix;
};
