import { ObjectId } from 'mongodb';
import { Lobby, Round } from './models';

interface AttemptStats {
    guessNumber: number;
    timesWonAtGuessNumber: number;
}

interface TimeStats {
    total: number;
    average: number;
    min: number;
    max: number;
    median: number;
}

interface RoundHistoryStats {
    guessAttempts: AttemptStats[];
    guessTime: TimeStats | undefined;
}

const GuessTimeInitial: TimeStats = {
    total: 0,
    min: 9999999999,
    max: 0,
    median: 0,
    average: 0,
};

export const getParticipantStatsForRound = (lobby: Lobby, round: Round, userId: ObjectId): RoundHistoryStats => {
    const guessAttempts = lobby.rounds.reduce((prev, curr) => {
        if (curr.sequence > round.sequence) return prev;

        const currentParticipant = curr.participants.find(p => p.user.equals(userId));
        const isWordSourceForCustomGame =
            lobby.gameMode === 'custom' &&
            lobby.gameRules.wordSource === 'one-player' &&
            currentParticipant &&
            currentParticipant.shouldProvideWord;

        if (!currentParticipant || isWordSourceForCustomGame) return prev;
        const guessesToWin = currentParticipant.guesses.find(g => g.mask === '33333')?.sequence || -1;

        let attemptStats = prev.find(p => p.guessNumber === guessesToWin);

        if (!attemptStats) {
            attemptStats = { guessNumber: guessesToWin, timesWonAtGuessNumber: 0 };
            prev.push(attemptStats);
        }

        attemptStats.timesWonAtGuessNumber += 1;
        return prev;
    }, [] as AttemptStats[]);

    let guessTime: TimeStats | undefined = undefined;
    const currentParticipant = round.participants.find(p => p.user.equals(userId));

    if (currentParticipant) {
        guessTime = { ...GuessTimeInitial };
        const guessTimes = currentParticipant.guesses.map(g => g.timeSpent);
        guessTimes.sort((a, b) => a - b);

        guessTime.total = guessTimes.reduce((timePrev, timeCurr) => timePrev + timeCurr, 0);
        guessTime.average = guessTime.total / guessTimes.length;
        guessTime.min = guessTimes[0];
        guessTime.max = guessTimes[guessTimes.length - 1];
        guessTime.median = guessTimes[Math.round(guessTimes.length / 2)];
    }

    return { guessAttempts, guessTime };
};

export const getLobbyStats = (lobby: Lobby, userId: ObjectId): RoundHistoryStats | undefined => {
    if (!lobby.rounds?.length) return undefined;
    const finishedRounds = lobby.rounds.filter(r => !r.active);

    if (finishedRounds.length === 0) return undefined;
    finishedRounds.sort((a, b) => b.sequence - a.sequence);

    const lastRound = finishedRounds[0];
    return getParticipantStatsForRound(lobby, lastRound, userId);
};
