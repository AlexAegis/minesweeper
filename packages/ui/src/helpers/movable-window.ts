import type { Rectangle } from '../components/rectangle.interface';

export const cloneRectangle = (element: Element): Rectangle => {
	const rectangle = element.getBoundingClientRect();

	return {
		height: rectangle.height,
		width: rectangle.width,
		x: rectangle.x,
		y: rectangle.y,
	};
};

export interface WindowResizeContext {
	minWidth: number;
	minHeight: number;
	widthSink: number;
	heightSink: number;
	minWidthAchievedAtDist: number | undefined;
	minHeightAchievedAtDist: number | undefined;
	startRectangle: Rectangle;
}

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
	},
): {
	before: Rectangle;
	after: Rectangle;
} => {
	const originalWidthStyle = element.style.width;
	const originalHeightStyle = element.style.width;
	const before = cloneRectangle(element);
	element.style.width = temporaryChanges.width.toString() + 'px';
	element.style.height = temporaryChanges.height.toString() + 'px';
	const after = cloneRectangle(element);
	element.style.width = originalWidthStyle;
	element.style.height = originalHeightStyle;

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
