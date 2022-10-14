import type { CoordinateLike } from '../core';
import type { MinesweeperGame } from '../store';
import type { DesktopProgram, WindowId } from '../store/desktop.store';

export interface BaseWindowState {
	windowId: WindowId;
	program?: DesktopProgram;
	title: string;
	icon: string | undefined;
	position: CoordinateLike;
	width: number;
	height: number;
	maximized: boolean;
	resizable: boolean;
	active: boolean;
}

export interface ProgramWindowState<ProgramData> extends BaseWindowState {
	programData: ProgramData;
}

export interface MineSweeperWindowState extends ProgramWindowState<MinesweeperGame> {
	program: DesktopProgram.MINESWEEPER;
}

export type WindowState = MineSweeperWindowState | BaseWindowState;

export const initialWindowState: BaseWindowState = {
	windowId: '-2',
	active: false,
	height: 100,
	icon: '',
	maximized: false,
	resizable: true,
	title: '...',
	width: 100,
	position: {
		x: 200,
		y: 200,
	},
};
