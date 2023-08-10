export interface GamePreset {
	width: number;
	height: number;
	mineCount: number;
}

export interface WinData {
	time: number;
	preset: GamePreset;
	cheated: boolean;
}

export enum PresetKeys {
	BEGINNER = 'beginner',
	INTERMEDIATE = 'intermediate',
	EXPERT = 'expert',
}

export function isTheSamePreset(a: GamePreset | undefined, b: GamePreset | undefined): boolean {
	return (
		!!a && !!b && a.height === b.height && a.width === b.width && a.mineCount === b.mineCount
	);
}
