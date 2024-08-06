import { differenceInHours, formatISO } from 'date-fns';
import { LobbyStatus } from '.';
import { WordlistMaster } from '../data/wordlist';
import { Guess, Lobby, Round } from '../models';
import { createParticipant, getNextRoundSequence, standardGetGuessResult } from './helpers';
import IGameLogic, { CanParticipantGuessContext, GuessResultContext, UserRoundStatusContext } from './IGameLogic';

export class ContinuousGameLogic implements IGameLogic {
    getUserRoundStatus({ round, participant }: UserRoundStatusContext): LobbyStatus {
        const hasCorrectGuess = participant.guesses?.some(g => g.mask === '33333');
        const hasGuessesRemaining = !participant.guesses || participant.guesses?.length < 6;

        if (hasCorrectGuess) return 'ROUND_WON';
        if (hasGuessesRemaining && round.active) return 'ROUND_ACTIVE';

        return 'ROUND_LOST';
    }

    isEndOfGame(): boolean {
        return false;
    }

    isReadyForNextRound(lobby: Lobby): boolean {
        console.debug(
            'Checking if a Lobby is ready for the next round, joinKey=',
            lobby.joinKey,
            'deleted=',
            lobby.deleted,
            'started=',
            lobby.hasGameStarted,
            'ended=',
            lobby.hasGameEnded,
            'numberOfRounds=',
            lobby.rounds.length,
        );

        if (lobby.deleted || !lobby.hasGameStarted || lobby.hasGameEnded) return false;
        if (lobby.rounds.length === 0) return true;

        const latestRound = lobby.rounds.reduce(
            (prev, curr) => (!prev || prev.sequence < curr.sequence ? curr : prev),
            lobby.rounds[0],
        );

        const hasExpired = differenceInHours(new Date(), latestRound.timestamp) >= 24;
        const hasEveryoneFinished = latestRound.participants.every(p => p.isDone);

        console.debug('hasExpired=', hasExpired, 'hasEveryoneFinished=', hasEveryoneFinished);
        return hasExpired || hasEveryoneFinished;
    }

    getGuessResult({ round, participant, word, guessKey, timeSpent }: GuessResultContext): Guess {
        return standardGetGuessResult(round, participant, word, guessKey, timeSpent);
    }

    canParticipantGuess({ participant, offset = 0 }: CanParticipantGuessContext) {
        return participant.guesses.length + offset < 6;
    }

    createRound(lobby: Lobby): Round {
        console.debug('Creating round for lobby', lobby);
        const findWord = () => {
            const getWord = () => WordlistMaster[Math.floor(Math.random() * WordlistMaster.length)];
            let word = getWord();

            while (lobby.rounds.some(l => l.word === word)) {
                word = getWord();
            }

            return word;
        };

        const word = findWord();
        const roundKey = formatISO(new Date());
        const expectedEndDate = new Date();
        expectedEndDate.setDate(expectedEndDate.getDate() + 1);
        console.debug(
            'Starting new round with word=',
            word,
            'roundKey=',
            roundKey,
            'expectedEndDate=',
            expectedEndDate,
        );

        return {
            word,
            sequence: getNextRoundSequence(lobby),
            timestamp: new Date(),
            participants: lobby.users.map(createParticipant),
            active: true,
            gameModeRoundKey: roundKey,
            expectedEndDate,
        };
    }
}
