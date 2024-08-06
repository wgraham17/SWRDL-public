import { ObjectId } from 'mongodb';
import { Guess, Lobby, Participant, Round } from '../models';

export const createParticipant = (user: ObjectId): Participant => ({
    user,
    hasBeenNotified: false,
    isDone: false,
    guesses: [],
    invalidWords: [],
    shouldProvideWord: false,
});

export const getNextRoundSequence = (lobby: Lobby) =>
    lobby.rounds.reduce((prev, curr) => (prev > curr.sequence ? prev : curr.sequence), 0) + 1;

export const getNextGuessSequence = (participant: Participant) =>
    participant.guesses.reduce((prev, curr) => (prev > curr.sequence ? prev : curr.sequence), 0) + 1;

export const getGuessResultForTargetWord = (
    targetWord: string,
    participant: Participant,
    word: string,
    guessKey: number,
    timeSpent: number,
): Guess => {
    const roundLetters = Array.from(targetWord.toUpperCase());
    const guessMask = ['1', '1', '1', '1', '1'];

    for (let index = 0; index < targetWord.length; index++) {
        if (targetWord[index].toUpperCase() === word[index].toUpperCase()) {
            guessMask[index] = '3';
            roundLetters[index] = '_';
        }
    }

    for (let index = 0; index < word.length; index++) {
        const matchedIndex = roundLetters.indexOf(word[index].toUpperCase());

        if (matchedIndex > -1 && guessMask[index] === '1') {
            guessMask[index] = '2';
            roundLetters[matchedIndex] = '_';
        }
    }

    return {
        guessKey,
        sequence: getNextGuessSequence(participant),
        timestamp: new Date(),
        value: word.toUpperCase(),
        score: 0, //TODO: Implement score
        mask: guessMask.join(''),
        timeSpent,
    };
};

export const standardGetGuessResult = (
    round: Round,
    participant: Participant,
    word: string,
    guessKey: number,
    timeSpent: number,
): Guess => {
    if (!round.word) throw new Error('Round does not have word');

    return getGuessResultForTargetWord(round.word, participant, word, guessKey, timeSpent);
};
