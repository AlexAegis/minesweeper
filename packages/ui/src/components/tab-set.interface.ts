export type TabSetTabs = Record<string, TabSetTabOption>;

export interface TabSetTabOption {
	displayName: string;
	disabled: boolean;
}
