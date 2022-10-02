export const GAME_PRESETS: Record<PresetKeys, GamePreset> = {
	beginner: {
		width: 9,
		height: 9,
		mineCount: 4,
	},
	intermediate: {
		width: 16,
		height: 16,
		mineCount: 40,
	},
	expert: {
		width: 30,
		height: 16,
		mineCount: 99,
	},
};

const debug = true;
if (debug) {
	GAME_PRESETS['debug'] = {
		width: 2,
		height: 2,
		mineCount: 2,
	} as GamePreset;
}

export interface GamePreset {
	width: number;
	height: number;
	mineCount: number;
}

export interface WinData {
	id: number;
	time: number;
	preset: GamePreset;
}

export enum PresetKeys {
	BEGINNER = 'beginner',
	INTERMEDIATE = 'intermediate',
	EXPERT = 'expert',
}

export function isTheSamePreset(a: GamePreset, b: GamePreset): boolean {
	return a && b && a.height === b.height && a.width === b.width && a.mineCount === b.mineCount;
}