import { format } from 'date-fns';
import { formatInTimeZone, getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { LobbyStatus } from '.';
import { WordlistMaster } from '../data/wordlist';
import { Guess, Lobby, Round } from '../models';
import { createParticipant, getNextRoundSequence, standardGetGuessResult } from './helpers';
import IGameLogic, { CanParticipantGuessContext, GuessResultContext, UserRoundStatusContext } from './IGameLogic';

export class ClassicGameLogic implements IGameLogic {
    isEndOfGame(): boolean {
        // Classic game mode is perpetual until ended
        return false;
    }

    getUserRoundStatus({ round, participant }: UserRoundStatusContext): LobbyStatus {
        const hasCorrectGuess = participant.guesses?.some(g => g.mask === '33333');
        const hasGuessesRemaining = !participant.guesses || participant.guesses?.length < 6;

        if (hasCorrectGuess) return 'ROUND_WON';
        if (hasGuessesRemaining && round.active) return 'ROUND_ACTIVE';

        return 'ROUND_LOST';
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

        console.debug('Latest round for the lobby', latestRound);
        const todayKey = formatInTimeZone(new Date(), lobby.tz, 'yyyy-MM-dd');
        const isSameDay = latestRound.gameModeRoundKey === todayKey;
        console.debug('roundKey=', latestRound.gameModeRoundKey, 'todayKey=', todayKey, 'isSameDay=', isSameDay);

        return !isSameDay;
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
        const now = new Date();
        const roundKey = format(utcToZonedTime(new Date(), lobby.tz), 'yyyy-MM-dd');
        const expectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        expectedEndDate.setTime(expectedEndDate.getTime() - getTimezoneOffset(lobby.tz, expectedEndDate));

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
