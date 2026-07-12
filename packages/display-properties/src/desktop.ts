import {
	defaultCommonProgramWindowPreferences,
	w2kDisplaySettingsIconLarge,
	type ProgramState,
} from '@w2k/ui';

export const displayPropertiesProgramInstallation: ProgramState = {
	...defaultCommonProgramWindowPreferences,
	name: 'displayProperties',
	icon: w2kDisplaySettingsIconLarge,
	initialWindowState: {
		title: 'Display Properties',
		resizable: false,
		fitContent: true,
		showHelp: true,
		showMaximize: false,
		showMinimize: false,
		titleBarIcon: w2kDisplaySettingsIconLarge,
	},
};
