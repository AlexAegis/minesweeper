export interface W2kGlobal {
	w2kZoom: number;
}

export const readGlobal = <K extends keyof W2kGlobal>(key: K): W2kGlobal[K] => {
	return (globalThis as unknown as W2kGlobal)[key];
};

export const writeGlobal = <K extends keyof W2kGlobal>(key: K, value: W2kGlobal[K]): void => {
	(globalThis as unknown as W2kGlobal)[key] = value;
};
