import { type DesktopColorScheme } from '@w2k/ui';

export interface DesktopSchemeItem {
	displayName: string;
	name: string;
	colorCount: 0 | 1 | 2;
	// hasFontElement: boolean, etc
}

export const desktopColorSchemeItems: Record<keyof DesktopColorScheme, DesktopSchemeItem> = {
	desktop: { displayName: 'Desktop', name: 'desktop', colorCount: 1 },
	objects3D: { displayName: '3D Objects', name: 'objects3D', colorCount: 1 },
	activeTitleBar: { displayName: 'Active Title Bar', name: 'activeTitleBar', colorCount: 2 },
};

export const desktopColorSchemeSelectOptions = Object.fromEntries(
	Object.entries(desktopColorSchemeItems).map(([key, item]) => [key, item.displayName]),
);

export const defaultDesktopColorScheme: DesktopColorScheme = {
	desktop: { color1: { r: 58, g: 110, b: 165 } },
	objects3D: { color1: { r: 212, g: 208, b: 200 } },
	activeTitleBar: {
		color1: { r: 10, g: 36, b: 106 },
		color2: { r: 166, g: 202, b: 240 },
	},
};
