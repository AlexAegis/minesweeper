import type { DesktopProgram, ProgramId } from '../store/desktop.store';

export interface WindowState {
	title: string;
	programId: ProgramId;
	program?: DesktopProgram;
	icon: string | undefined;
	x: number;
	y: number;
	width: number;
	height: number;
	maximized: boolean;
	resizable: boolean;
	tight: boolean;
	active: boolean;
}

export const initialWindowState: WindowState = {
	active: false,
	height: 100,
	icon: '',
	maximized: false,
	programId: -2,
	resizable: false,
	tight: false,
	title: '...',
	width: 100,
	x: 200,
	y: 200,
};
