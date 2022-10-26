export const capitalize = (s: string): string =>
	s.length > 0 ? s[0].toUpperCase() + s.substring(1) : s;
