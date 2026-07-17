import type { Rectangle } from '../components/rectangle.interface';

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
	const before: Rectangle = {
		height: element.offsetHeight,
		width: element.offsetWidth,
		x: element.offsetLeft,
		y: element.offsetTop,
	};

	element.style.width = temporaryChanges.width.toString() + 'px';
	element.style.height = temporaryChanges.height.toString() + 'px';
	const after: Rectangle = {
		height: element.offsetHeight,
		width: element.offsetWidth,
		x: element.offsetLeft,
		y: element.offsetTop,
	};
	element.style.width = originalWidthStyle;
	element.style.height = originalHeightStyle;

	return {
		before,
		after,
	};
};
