import { ClassicGameLogic } from './classic-game-logic';
import IGameLogic from './IGameLogic';
import { ContinuousGameLogic } from './continuous-game-logic';
import { CustomGameLogic } from './custom-game-logic';

export type GameMode = 'classic' | 'classic-continuous' | 'custom';
export type LobbyStatus =
    | 'WAIT_GAME_START'
    | 'WAIT_NEXT_ROUND'
    | 'ROUND_SETUP_SELF'
    | 'ROUND_SETUP_OTHERS'
    | 'ROUND_ACTIVE'
    | 'ROUND_LOST'
    | 'ROUND_WON'
    | 'ROUND_NOT_GUESSING'
    | 'GAME_ENDED';

export const GameModeLookup: Record<GameMode, IGameLogic> = {
    classic: new ClassicGameLogic(),
    'classic-continuous': new ContinuousGameLogic(),
    custom: new CustomGameLogic(),
};
