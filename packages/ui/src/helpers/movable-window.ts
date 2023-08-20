import type { Rectangle } from '../components/rectangle.interface';

export const cloneRectangle = (element: Element, round = false): Rectangle => {
	const rectangle = element.getBoundingClientRect();

	return {
		height: round ? Math.round(rectangle.height) : rectangle.height,
		width: round ? Math.round(rectangle.width) : rectangle.width,
		x: round ? Math.round(rectangle.x) : rectangle.x,
		y: round ? Math.round(rectangle.y) : rectangle.y,
	};
};

/**
 * This method temporarily applies a style to an element, then returns
 * the client bounding rectangles before and after the temporary change.
 * The style properties are changed back to what they were before originally.
 */
export const checkStyleResult = (
	element: HTMLElement,
	temporaryChanges: {
		width: number;
		height: number;
		x: number;
		y: number;
	},
): {
	before: Rectangle;
	after: Rectangle;
} => {
	const originalWidthStyle = element.style.width;
	const originalHeightStyle = element.style.height;
	// const originalLeftStyle = element.style.left;
	// const originalTopStyle = element.style.top;
	const before: Rectangle = {
		height: element.offsetHeight,
		width: element.offsetWidth,
		x: element.offsetLeft,
		y: element.offsetTop,
	};

	element.style.width = temporaryChanges.width.toString() + 'px';
	element.style.height = temporaryChanges.height.toString() + 'px';
	// element.style.top = temporaryChanges.y.toString() + 'px';
	// element.style.left = temporaryChanges.x.toString() + 'px';
	const after: Rectangle = {
		height: element.offsetHeight,
		width: element.offsetWidth,
		x: element.offsetLeft,
		y: element.offsetTop,
	};
	element.style.width = originalWidthStyle;
	element.style.height = originalHeightStyle;
	// 	element.style.top = originalLeftStyle;
	// 	element.style.left = originalTopStyle;

	return {
		before,
		after,
	};
};

export const checkIfCouldBeSmaller = (
	element: HTMLElement,
): { widthCanBeSmaller: boolean; heightCanBeSmaller: boolean } => {
	const originalWidthStyle = element.style.width;
	const originalHeightStyle = element.style.width;
	const before = cloneRectangle(element);
	element.style.width = (before.width - 1).toString() + 'px';
	element.style.height = (before.height - 1).toString() + 'px';
	const after = cloneRectangle(element);
	element.style.width = originalWidthStyle;
	element.style.height = originalHeightStyle;
	return {
		heightCanBeSmaller: before.height !== after.height,
		widthCanBeSmaller: before.width !== after.width,
	};
};
