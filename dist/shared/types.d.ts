/**
 * Pet state and message types for VS Code Pet extension
 */
export interface PetStats {
    mood: number;
    hunger: number;
    energy: number;
}
export interface PetState extends PetStats {
    animationState: 'idle' | 'happy' | 'neutral' | 'sad' | 'eating' | 'bouncing' | 'purring';
    lastInteraction: number;
    lastUpdated: number;
}
export type PetMessageCommand = {
    command: 'interact';
    action: 'feed' | 'play' | 'pet';
} | {
    command: 'syncState';
    state: PetState;
} | {
    command: 'theme';
    theme: 'vscode-light' | 'vscode-dark';
} | {
    command: 'getTheme';
};
//# sourceMappingURL=types.d.ts.map