import { isNotNullish } from '@alexaegis/common';

export function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		const temporaryValue = array[currentIndex];
		const randomValue = array[randomIndex];
		if (isNotNullish(temporaryValue) && isNotNullish(randomValue)) {
			array[currentIndex] = randomValue;
			array[randomIndex] = temporaryValue;
		}
	}

	return array;
}
