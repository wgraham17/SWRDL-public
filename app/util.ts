/* eslint-disable import/prefer-default-export */
import { CustomLobbyGameRules, GameMode, LobbyStatus } from '@root/models';

export const GameModeDisplayNames: Record<GameMode, string> = {
    classic: 'Daily Classic',
    versus: 'Versus',
    'classic-continuous': 'Continuous Classic',
    custom: 'Custom Game',
};

export const GetGameModeName = (gameRules: CustomLobbyGameRules) => {
    let name = '';

    if (!gameRules.guessLimit) {
        name += 'NL ';
    }

    if (gameRules.maskResult === 'position') {
        name += 'Classic ';
    } else if (gameRules.maskResult === 'existence') {
        name += 'Hardcore ';
    }

    if (gameRules.wordSource === 'one-player') {
        name += 'Custom ';
    } else if (gameRules.wordSource === 'pvp') {
        name += 'Versus ';
    }

    if (gameRules.strict) {
        name += '(Strict) ';
    }

    name = name.substring(0, name.length - 1);
    return name;
};

export const JoinKeyFormatter = (joinKey: string) =>
    `${joinKey.slice(0, 2)} ${joinKey.slice(2, 5)} ${joinKey.slice(5, 7)}`;

export const StatusDisplayMessage: Record<LobbyStatus, string> = {
    WAIT_GAME_START: 'Waiting for host to start...',
    WAIT_NEXT_ROUND: 'Waiting for the next round...',
    ROUND_SETUP_SELF: 'Need to pick a word to guess!',
    ROUND_SETUP_OTHERS: 'Waiting for someone to pick a word...',
    ROUND_NOT_GUESSING: 'Waiting for the next round...',
    ROUND_ACTIVE: 'Ready to play!',
    ROUND_LOST: 'Round lost, waiting for next round...',
    ROUND_WON: 'Round won! Waiting for next round...',
    GAME_ENDED: 'Game has ended.',
};

export const FormatMsToReadable = (value: number) => {
    const totalSeconds = Math.floor(value / 1000);

    if (totalSeconds > 60) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds - minutes * 60;
        return `${minutes}m ${seconds}s`;
    }

    return `${totalSeconds}s`;
};

export const FormatWithOrdinalIndicator = (v: number) => {
    const d = (v % 100) / 10;
    const m = v % 10;
    if ((d < 1 || d > 2) && m === 1) return `${v}st`;
    if ((d < 1 || d > 2) && m === 2) return `${v}nd`;
    if ((d < 1 || d > 2) && m === 3) return `${v}rd`;

    return `${v}th`;
};
