import { defaultCommonProgramWindowPreferences, type ProgramState } from '@w2k/ui';


export const displayPropertiesProgramInstallation: ProgramState = {
	...defaultCommonProgramWindowPreferences,
	name: 'displayProperties',
	icon: '',
	initialWindowState: {
		title: 'Display Properties',
		resizable: false,
		fitContent: true,
		showHelp: true,
		showMaximize: false,
		showMinimize: false,
		titleBarIcon: '',
	},
};
