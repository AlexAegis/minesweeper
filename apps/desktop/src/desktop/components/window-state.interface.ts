import type { CoordinateLike } from 'common';
import type { MinesweeperGame } from '../../minesweeper/store';
import type { ProcessId, ProgramName } from '../store/desktop.store';

export interface BaseWindowState {
	processId: ProcessId;
	program?: ProgramName;
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
	minWidth: number;
	minHeight: number;
	fitContent: boolean;
	invisible: boolean;
	zIndex: number;
}

export interface ProgramWindowState<ProgramData> extends BaseWindowState {
	programData: ProgramData;
}

export interface MineSweeperWindowState extends ProgramWindowState<MinesweeperGame> {
	program: ProgramName.MINESWEEPER;
}

export type WindowState = MineSweeperWindowState | BaseWindowState;

export const initialWindowState: BaseWindowState = {
	processId: '-2',
	title: '...',
	icon: '',
	active: true,
	height: 100,
	width: 80,
	position: {
		x: 200,
		y: 200,
	},
	maximized: false,
	resizable: true,
	minWidth: 120,
	minHeight: 45, // 45: titlebar and menubar together
	fitContent: false,
	invisible: false,
	zIndex: 10,
};
