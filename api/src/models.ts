import { ExpoPushReceipt } from 'expo-server-sdk';
import { ObjectId } from 'mongodb';

export type LobbyEndReason =
    | 'completed'
    | 'host-initiated'
    | 'timed-out'
    | 'never-started'
    | 'dropped-below-min-players';

export type UserNotifications = {
    enabled: boolean;
    token?: string | undefined;
    prompted?: boolean;
};

export interface User {
    _id?: ObjectId;
    name: string;
    token: string;
    connections: string[];
    notifications?: UserNotifications | undefined;
    emailHash?: string;
    emailConfirmed?: boolean;
}

export interface Guess {
    guessKey: number;
    sequence: number;
    value: string;
    mask: string;
    timestamp: Date;
    score: number;
    timeSpent: number;
}

export interface Participant {
    user: ObjectId;
    guesses: Guess[];
    hasBeenNotified: boolean;
    isDone: boolean;
    invalidWords: string[];
    word?: string | undefined;
    shouldProvideWord: boolean;
}

export interface Round {
    sequence: number;
    gameModeRoundKey: string;
    timestamp: Date;
    word: string | undefined;
    participants: Participant[];
    active: boolean;
    expectedEndDate: Date;
    endDate?: Date;
}

interface ILobby {
    _id?: ObjectId;
    joinKey: string;
    hasGameStarted: boolean;
    hasGameEnded: boolean;
    tz: string;
    owner: ObjectId;
    users: ObjectId[];
    rounds: Round[];
    deleted: boolean;
    createDate: Date;
    startDate?: Date;
    endDate?: Date;
    endReason?: LobbyEndReason;
}

interface StandardLobby extends ILobby {
    gameMode: 'classic' | 'classic-continuous';
}
interface CustomLobbyGameRules {
    wordSource: 'dictionary' | 'one-player' | 'pvp';
    interval: 'continuous' | 'daily';
    minPlayers: number;
    maxPlayers: number;
    guessLimit: number | undefined;
    maskResult: 'position' | 'existence';
    strict: boolean;
}

interface CustomLobby extends ILobby {
    gameMode: 'custom';
    gameRules: CustomLobbyGameRules;
    name: string;
}

export type Lobby = CustomLobby | StandardLobby;

export type NotificationDeliveryStatus = 'pending' | 'success' | 'error';

export interface Notification {
    _id?: ObjectId;
    userId: ObjectId;
    ticket: string;
    sendDate: Date;
    deliveryStatus: NotificationDeliveryStatus;
    receipt?: ExpoPushReceipt | undefined;
}
