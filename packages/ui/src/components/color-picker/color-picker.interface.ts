export interface ColorRgb {
	r: number;
	g: number;
	b: number;
}

export interface ColorHsl {
	h: number;
	s: number;
	l: number;
}

export const toCssRgb = (color: ColorRgb | undefined): string =>
	color ? `rgb(${color.r} ${color.g} ${color.b});` : 'transparent';

export const COMMON_COLORS = {
	white: { r: 255, g: 255, b: 255 } as ColorRgb,
	black: { r: 0, g: 0, b: 0 } as ColorRgb,
	lightGray: { r: 192, g: 192, b: 192 } as ColorRgb,
	darkGray: { r: 128, g: 128, b: 128 } as ColorRgb,
	red: { r: 255, g: 0, b: 0 } as ColorRgb,
	darkRed: { r: 128, g: 0, b: 0 } as ColorRgb,
	yellow: { r: 255, g: 255, b: 0 } as ColorRgb,
	darkYellow: { r: 128, g: 128, b: 0 } as ColorRgb,
	green: { r: 0, g: 255, b: 0 } as ColorRgb,
	darkGreen: { r: 0, g: 128, b: 0 } as ColorRgb,
	cyan: { r: 0, g: 255, b: 255 } as ColorRgb,
	darkCyan: { r: 0, g: 128, b: 128 } as ColorRgb,
	blue: { r: 0, g: 0, b: 255 } as ColorRgb,
	darkBlue: { r: 0, g: 0, b: 128 } as ColorRgb,
	purple: { r: 255, g: 0, b: 255 } as ColorRgb,
	darkPurple: { r: 128, g: 0, b: 128 } as ColorRgb,
} as const;
