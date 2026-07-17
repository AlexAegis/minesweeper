/**
 * Runs the callback after the next frame has been painted.
 *
 * There is no direct dom api for this: a requestAnimationFrame callback runs
 * at the start of the next frame, before that frame is painted, so a second
 * one is needed to get past the paint. Used to keep an element alive until its
 * final animation pose has actually reached the screen.
 */
export const afterNextPaint = (callback: () => void): void => {
	requestAnimationFrame(() => {
		requestAnimationFrame(callback);
	});
};
