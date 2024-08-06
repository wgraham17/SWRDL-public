export interface UserInfo {
    id: string;
    name: string;
}

export interface UserCredentials extends UserInfo {
    token: string;
}

export interface UserAuthResponse extends UserCredentials {
    notificationsEnabled: boolean;
    notificationsPrompted: boolean;
    recoveryEnabled: boolean;
}

export type GameMode = 'classic' | 'classic-continuous' | 'versus' | 'custom';
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

export type WordSource = 'dictionary' | 'one-player' | 'pvp';
export type Interval = 'continuous' | 'daily';
export type MaskResult = 'position' | 'existence';

export interface CustomLobbyGameRules {
    wordSource: WordSource;
    interval: Interval;
    minPlayers: number;
    maxPlayers: number;
    guessLimit: number | undefined;
    maskResult: MaskResult;
    strict: boolean;
}

export interface LobbyCreateCustomRequest {
    gameMode: 'custom';
    tz: string;
    gameRules: CustomLobbyGameRules;
    name: string;
}

export interface LobbyCreateResult {
    joinKey: string;
}

export interface Guess {
    mask: string;
    score: number;
    word: string | null;
    guessKey: number;
}

export interface LetterMasks {
    contained: string[];
    correct: string[];
}

export interface AttemptStats {
    guessNumber: number;
    timesWonAtGuessNumber: number;
}

export interface TimeStats {
    total: number;
    average: number;
    min: number;
    max: number;
    median: number;
}

export interface ParticipantStats {
    guessAttempts: AttemptStats[];
    guessTime: TimeStats | undefined;
}

export interface Participant {
    user: string;
    isDone: boolean;
    guesses: Guess[];
    letterMasks: LetterMasks;
    stats?: ParticipantStats | undefined;
    invalidWords: string[];
    shouldProvideWord: boolean;
    word: string | undefined;
    status: LobbyStatus;
}

export interface Round {
    sequence: number;
    word: string | null;
    active: boolean;
    participants: Participant[];
    expectedEndDate: string;
}

export interface Lobby {
    joinKey: string;
    host: string;
    gameMode: GameMode;
    gameRules: CustomLobbyGameRules | undefined;
    users: { id: string }[];
    status: LobbyStatus;
    rounds: Round[];
    name: string | undefined;
}

export interface SubmitGuessRequest {
    guess: string;
    guessKey: number;
    timeSpent: number;
}

export interface SubmitGuessResult {
    mask: string;
}

export interface SubmitWordRequest {
    word: string;
}
