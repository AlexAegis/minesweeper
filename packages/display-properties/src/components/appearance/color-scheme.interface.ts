import type { SomeDefined } from '@alexaegis/common';
import { toCssRgb, type ColorRgb } from '@w2k/ui';
import { colord } from 'colord';

export interface DesktopColorScheme {
	/**
	 * Used as background color
	 */
	desktop: SomeDefined<DesktopColorSchemeItem, 'color1'>;
	objects3D: SomeDefined<DesktopColorSchemeItem, 'color1'>;
	activeTitleBar: SomeDefined<DesktopColorSchemeItem, 'color1' | 'color2'>;
}

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

export interface DesktopColorSchemeItem {
	color1?: ColorRgb | undefined;
	color2?: ColorRgb | undefined;
}

export const defaultDesktopColorScheme: DesktopColorScheme = {
	desktop: { color1: { r: 58, g: 110, b: 165 } },
	objects3D: { color1: { r: 212, g: 208, b: 200 } },
	activeTitleBar: {
		color1: { r: 10, g: 36, b: 106 },
		color2: { r: 166, g: 202, b: 240 },
	},
};

export const desktopColorSchemeToCssVariables = (scheme: DesktopColorScheme): string => {
	const objectColor = colord(scheme.objects3D.color1).toHsl();
	return `
	--win-3d-objects-color-h: ${objectColor.h};
	--win-3d-objects-color-s: ${objectColor.s}%;
	--win-3d-objects-color-l: ${objectColor.l}%;
	--win-desktop-color: ${toCssRgb(scheme.desktop.color1)};
	--win-active-title-bar-color: ${toCssRgb(scheme.activeTitleBar.color1)};
	--win-active-title-bar-color-2: ${toCssRgb(scheme.activeTitleBar.color2)};

	`; // TODO
};
