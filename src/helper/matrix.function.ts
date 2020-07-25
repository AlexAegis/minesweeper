export const makeMatrix = <T>(x: number, y = 0): T[][] => {
	const result = [];
	for (let i = 0; i < x; i++) {
		result.push(Array(y));
	}
	return result;
};
