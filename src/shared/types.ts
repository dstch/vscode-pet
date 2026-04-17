/**
 * Pet state and message types for VS Code Pet extension
 */

export interface PetStats {
  mood: number;    // 0-100
  hunger: number;  // 0-100
  energy: number;  // 0-100
}

export interface PetState extends PetStats {
  animationState: 'idle' | 'happy' | 'neutral' | 'sad' | 'eating' | 'bouncing' | 'purring';
  lastInteraction: number; // timestamp
  lastUpdated: number;     // timestamp of last stat update (for decay calculation)
}

export type PetMessageCommand = 
  | { command: 'interact'; action: 'feed' | 'play' | 'pet' }
  | { command: 'syncState'; state: PetState };
