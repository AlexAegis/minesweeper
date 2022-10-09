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
