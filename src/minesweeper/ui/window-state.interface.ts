import type { CoordinateLike } from '../core';
import type { MinesweeperGame } from '../store';
import type { DesktopProgram, ProcessId } from '../store/desktop.store';

export interface BaseWindowState {
	processId: ProcessId;
	program?: DesktopProgram;
	title: string;
	icon: string | undefined;
	active: boolean;
	/**
	 * Its initial value will act as the minimum height of the window as
	 * resizable is using scollHeight as the minimum size
	 */
	height: number;
	width: number;
	position: CoordinateLike;
	maximized: boolean;
	resizable: boolean;
}

export interface ProgramWindowState<ProgramData> extends BaseWindowState {
	programData: ProgramData;
}

export interface MineSweeperWindowState extends ProgramWindowState<MinesweeperGame> {
	program: DesktopProgram.MINESWEEPER;
}

export type WindowState = MineSweeperWindowState | BaseWindowState;

export const initialWindowState: BaseWindowState = {
	processId: '-2',
	title: '...',
	icon: '',
	active: false,
	height: 100,
	width: 80,
	position: {
		x: 200,
		y: 200,
	},
	maximized: false,
	resizable: true,
};