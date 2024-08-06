import { differenceInHours, format, formatISO } from 'date-fns';
import { formatInTimeZone, getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { LobbyStatus } from '.';
import { WordlistMaster } from '../data/wordlist';
import { Guess, Lobby, Round } from '../models';
import {
    createParticipant,
    getGuessResultForTargetWord,
    getNextRoundSequence,
    standardGetGuessResult,
} from './helpers';
import IGameLogic, { CanParticipantGuessContext, GuessResultContext, UserRoundStatusContext } from './IGameLogic';

export class CustomGameLogic implements IGameLogic {
    isEndOfGame(): boolean {
        return false;
    }

    getUserRoundStatus({ lobby, round, participant }: UserRoundStatusContext): LobbyStatus {
        if (lobby.gameMode !== 'custom') throw new Error('Not custom game');
        const hasCorrectGuess = participant.guesses?.some(g => g.mask === '33333');

        let hasGuessesRemaining = true;

        if (lobby.gameRules.guessLimit) {
            hasGuessesRemaining = !participant.guesses || participant.guesses?.length < lobby.gameRules.guessLimit;
        }

        // If we got it correct, we won!
        if (hasCorrectGuess) {
            return 'ROUND_WON';
        }

        if (round.active && lobby.gameRules.wordSource === 'pvp') {
            if (!participant.word) return 'ROUND_SETUP_SELF';
            if (!round.participants.every(p => !!p.word)) return 'ROUND_SETUP_OTHERS';
        }

        if (round.active && lobby.gameRules.wordSource === 'one-player') {
            if (participant.shouldProvideWord) {
                if (!round.word) return 'ROUND_SETUP_SELF';
                return 'ROUND_NOT_GUESSING';
            }

            if (!round.word) return 'ROUND_SETUP_OTHERS';
        }

        // If we have guesses remaining and the round is still active, ezpz
        if (hasGuessesRemaining && round.active) return 'ROUND_ACTIVE';

        // If we got here we're a loser
        return 'ROUND_LOST';
    }

    isReadyForNextRound(lobby: Lobby): boolean {
        if (lobby.gameMode !== 'custom') throw new Error('Not custom game');
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

        const hasEveryoneFinished = latestRound.participants.every(p => p.isDone);
        console.debug('hasEveryoneFinished=', hasEveryoneFinished);

        if (lobby.gameRules.interval === 'continuous') {
            if (hasEveryoneFinished) return true;

            const hasExpired = differenceInHours(new Date(), latestRound.timestamp) >= 24;
            console.debug('hasExpired=', hasExpired);

            if (hasExpired) return true;
        }

        if (lobby.gameRules.interval === 'daily') {
            const todayKey = formatInTimeZone(new Date(), lobby.tz, 'yyyy-MM-dd');
            const isSameDay = latestRound.gameModeRoundKey === todayKey;

            console.debug(
                'gameModeRoundKey=',
                latestRound.gameModeRoundKey,
                'todayKey=',
                todayKey,
                'isSameDay=',
                isSameDay,
            );

            if (!isSameDay) return true;
        }

        return false;
    }

    getGuessResult({ lobby, round, participant, word, guessKey, timeSpent }: GuessResultContext): Guess {
        if (lobby.gameMode !== 'custom') throw new Error('Not custom game');
        let result: Guess | undefined;

        if (lobby.gameRules.wordSource === 'dictionary' || lobby.gameRules.wordSource === 'one-player') {
            result = standardGetGuessResult(round, participant, word, guessKey, timeSpent);
        }

        if (lobby.gameRules.wordSource === 'pvp') {
            const otherParticipant = round.participants.find(p => !p.user.equals(participant.user));

            if (!otherParticipant) throw new Error('Could not find other participant in PvP round');
            if (!otherParticipant.word) throw new Error('Trying to process guess but the other PvP player has no word');
            result = getGuessResultForTargetWord(otherParticipant.word, participant, word, guessKey, timeSpent);
        }

        if (!result) throw new Error('No guess result?');

        if (lobby.gameRules.maskResult === 'existence') {
            result.mask = Array.from(result.mask).sort().join('');
        }

        return result;
    }

    canParticipantGuess({ lobby, participant, offset = 0 }: CanParticipantGuessContext) {
        if (lobby.gameMode !== 'custom') throw new Error('Not custom game');

        if (lobby.gameRules.guessLimit) {
            return participant.guesses.length + offset < lobby.gameRules.guessLimit;
        }

        return true;
    }

    createRound(lobby: Lobby): Round {
        if (lobby.gameMode !== 'custom') throw new Error('Not custom game');
        console.debug('Creating round for lobby', lobby);
        const findWord = () => {
            // TODO: 10% chance to make the first word either "goose" or "farts" if this is the first lobby
            // the user has ever created
            const getWord = () => WordlistMaster[Math.floor(Math.random() * WordlistMaster.length)];
            let word = getWord();

            while (lobby.rounds.some(l => l.word === word)) {
                word = getWord();
            }

            return word;
        };

        let word: string | undefined;

        if (lobby.gameRules.wordSource === 'dictionary') {
            word = findWord();
        }

        const now = new Date();
        let roundKey: string;
        let expectedEndDate: Date;

        if (lobby.gameRules.interval === 'continuous') {
            roundKey = formatISO(new Date());
            expectedEndDate = new Date();
            expectedEndDate.setDate(expectedEndDate.getDate() + 1);
        } else {
            roundKey = format(utcToZonedTime(new Date(), lobby.tz), 'yyyy-MM-dd');
            expectedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
            expectedEndDate.setTime(expectedEndDate.getTime() - getTimezoneOffset(lobby.tz, expectedEndDate));
        }

        const participants = lobby.users.map(createParticipant);

        if (lobby.gameRules.wordSource === 'one-player') {
            // Let's pick the player to provide the word...
            console.debug('Determining who should pick the next word...');
            const previousRounds = lobby.rounds.slice(-lobby.users.length);
            const [lastRound] = lobby.rounds.slice(-1);

            const initialTable: Record<string, number> = Object.fromEntries(
                participants.map(p => [p.user.toHexString(), 0]),
            );

            console.debug(
                'Building table of pick counts, previousRounds=',
                previousRounds,
                'lastRound=',
                lastRound,
                'initialTable=',
                initialTable,
            );

            const roundsPicked: Record<string, number> = previousRounds.reduce((prev, curr) => {
                const picker = curr.participants.find(p => p.shouldProvideWord);
                if (!picker) throw new Error('Could not find picker for previous round');
                const pickerId = picker.user.toHexString();

                // Skip the user if they picked the previous round's word
                if (
                    !participants.some(p => p.user.toHexString() === pickerId) ||
                    lastRound?.participants?.find(p => p.user.toHexString() === pickerId)?.shouldProvideWord
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    [pickerId]: (prev[pickerId] || 0) + 1,
                };
            }, initialTable);

            console.debug('roundsPicked=', roundsPicked);

            let minPicks = lobby.users.length + 1;
            let users: string[] = [];

            for (const userId of Object.keys(roundsPicked)) {
                if (roundsPicked[userId] < minPicks) {
                    minPicks = roundsPicked[userId];
                    users = [userId];
                } else if (roundsPicked[userId] === minPicks) {
                    users.push(userId);
                }
            }

            if (users.length === 0) {
                console.debug('No users with min guess? All participants are eligible!');
                users = participants.map(p => p.user.toHexString());
            }

            const userPicking = users[Math.floor(users.length * Math.random())];
            console.debug('users=', users, 'userPicking=', userPicking);

            const participant = participants.find(p => p.user.toHexString() === userPicking);
            if (!participant) throw new Error('Could not find the participant in the round?!');
            participant.shouldProvideWord = true;
        } else if (lobby.gameRules.wordSource === 'pvp') {
            participants.forEach(p => (p.shouldProvideWord = true));
        }

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
            participants,
            active: true,
            gameModeRoundKey: roundKey,
            expectedEndDate,
        };
    }
}
