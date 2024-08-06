import { LobbyStatus } from '.';
import { Guess, Lobby, Participant, Round } from '../models';

export interface UserRoundStatusContext {
    lobby: Lobby;
    round: Round;
    participant: Participant;
}

export interface GuessResultContext {
    lobby: Lobby;
    round: Round;
    participant: Participant;
    word: string;
    guessKey: number;
    timeSpent: number;
}

export interface CanParticipantGuessContext {
    lobby: Lobby;
    participant: Participant;
    offset: number;
}

export default interface IGameLogic {
    getUserRoundStatus(context: UserRoundStatusContext): LobbyStatus;
    isReadyForNextRound(lobby: Lobby): boolean;
    createRound(lobby: Lobby): Round;
    isEndOfGame(lobby: Lobby): boolean;
    getGuessResult(context: GuessResultContext): Guess;
    canParticipantGuess(context: CanParticipantGuessContext): boolean;
}
