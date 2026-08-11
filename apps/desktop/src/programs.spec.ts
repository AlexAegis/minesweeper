import { displayPropertiesProgramInstallation } from '@w2k/display-properties';
import { minesweeperProgramInstallation } from '@w2k/minesweeper';
import type { ProgramState } from '@w2k/ui';
import { describe, expect, it } from 'vitest';

const installedPrograms: ProgramState[] = [
	minesweeperProgramInstallation,
	displayPropertiesProgramInstallation,
];

describe('installed programs', () => {
	// Their icons end up on the desktop, in the start menu, on the title bar
	// and on the taskbar, an install entry without one leaves a hole in all four
	it.each(installedPrograms)('should give $name an icon', (program) => {
		expect(program.icon).toBeTruthy();
		expect(program.initialWindowState.titleBarIcon).toBeTruthy();
	});

	it.each(installedPrograms)('should give $name a window title', (program) => {
		expect(program.initialWindowState.title).toBeTruthy();
	});
});
