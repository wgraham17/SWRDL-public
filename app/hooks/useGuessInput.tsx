/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import dictionary from '@root/data/dictionary';
import Toast from 'react-native-toast-message';
import { FormatWithOrdinalIndicator } from '@root/util';
import useAppUser from './useAppUser';
import { useLobby } from './useLobby';
import useActivityStopwatch from './useActivityStopwatch';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
const updateNoop = (_: string) => {};
const GuessInputContextInitial = {
    guess: '',
    appendLetter: updateNoop,
    backspace: noop,
    onSubmit: noop,
    onReset: noop,
    isSubmittingGuess: false,
    disabledLetters: new Set<string>(),
    canGuess: false,
    wasGuessInvalid: false,
    guessKey: undefined as number | undefined,
    startStopwatch: noop,
    pauseStopwatch: noop,
};

const GuessInputContext = React.createContext(GuessInputContextInitial);
const DictionaryLookup = new Set(dictionary.map(d => d.toUpperCase()));

interface Props {
    children: React.ReactNode;
    roundSequence: number;
    participantId: string;
}

export function GuessInputProvider({ children, roundSequence, participantId }: Props) {
    const { appUser } = useAppUser();
    const { lobby, submitGuess, isSubmittingGuess, submitInvalidWord } = useLobby();
    const [guess, setGuess] = useState('');
    const [wasGuessInvalid, setWasGuessInvalid] = useState(false);
    const [guessKey, setGuessKey] = useState<number>();
    const { startStopwatch, stopStopwatch, pauseStopwatch } = useActivityStopwatch();
    const appendLetter = useCallback((val: string) => setGuess(g => `${g}${val}`.slice(0, 5)), []);
    const backspace = useCallback(() => setGuess(g => `${g}`.slice(0, -1)), []);
    const isStrictMode = !!lobby?.gameRules?.strict;
    const previousGuess = lobby?.rounds
        ?.find(r => r.sequence === roundSequence)
        ?.participants?.find(p => p.user === participantId)
        ?.guesses?.slice(-1)
        ?.pop();

    const canGuess = useMemo(() => {
        const activeRound = lobby?.rounds.find(r => r.active);
        const participant = activeRound?.participants.find(u => u.user === appUser?.id);
        const isActiveRoundEligible = !!(activeRound && participant && !participant.isDone);

        return isActiveRoundEligible && activeRound?.sequence === roundSequence && participant?.user === participantId;
    }, [lobby, appUser, roundSequence, participantId]);

    const handleSubmit = useCallback(async () => {
        setWasGuessInvalid(false);

        if (!DictionaryLookup.has(guess.toUpperCase())) {
            console.debug('Attempting to guess a word not in the local dictionary');
            submitInvalidWord(guess);
            setTimeout(() => setWasGuessInvalid(true), 0);
            return;
        }

        if (isStrictMode && previousGuess && previousGuess.word) {
            // Validate the guess against previous mask
            const guessChars = [...guess];

            for (let charIndex = 0; charIndex < guessChars.length; charIndex += 1) {
                if (previousGuess.mask[charIndex] === '3') {
                    if (guessChars[charIndex] !== previousGuess.word[charIndex]) {
                        const letter = previousGuess.word[charIndex].toUpperCase();
                        Toast.show({
                            type: 'error',
                            text1: 'Oops!',
                            text2: `Your ${FormatWithOrdinalIndicator(charIndex + 1)} letter must be "${letter}"`,
                        });
                        setTimeout(() => setWasGuessInvalid(true), 0);
                        return;
                    }

                    guessChars[charIndex] = ' ';
                }
            }

            for (let charIndex = 0; charIndex < guessChars.length; charIndex += 1) {
                if (previousGuess.mask[charIndex] === '2') {
                    const indexInGuess = guessChars.indexOf(previousGuess.word[charIndex]);

                    if (indexInGuess < 0) {
                        const letter = previousGuess.word[charIndex].toUpperCase();
                        Toast.show({
                            type: 'error',
                            text1: 'Oops!',
                            text2: `Your guess must include "${letter}"`,
                        });
                        setTimeout(() => setWasGuessInvalid(true), 0);
                        return;
                    }

                    guessChars[indexInGuess] = ' ';
                }
            }
        }

        const currentGuessKey = new Date().getTime();
        setGuessKey(currentGuessKey);
        console.debug('Submitting a guess with guessKey', currentGuessKey);
        const timeSpent = stopStopwatch();
        const result = await submitGuess({ guess, timeSpent, guessKey: currentGuessKey });

        if (result?.mask !== '33333') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        setGuessKey(undefined);
        setGuess('');
    }, [submitGuess, guess, isStrictMode, previousGuess, stopStopwatch, submitInvalidWord]);

    const handleReset = useCallback(() => setGuess(''), []);

    const disabledLetters = useMemo(() => {
        const activeRound = lobby?.rounds.find(r => r.active);
        const participant = activeRound?.participants.find(u => u.user === appUser?.id);
        if (
            !activeRound ||
            !participant ||
            (lobby?.gameMode === 'custom' && lobby.gameRules?.maskResult === 'existence')
        )
            return new Set<string>();

        const lettersValid = new Set(
            participant.guesses.reduce((prev, curr) => {
                const accumulator = [...prev];
                const { mask, word } = curr;

                if (mask && word) {
                    Array.from(mask).forEach((v, i) => {
                        if (v === '2' || v === '3') accumulator.push(word.charAt(i));
                    });
                }

                return accumulator;
            }, [] as string[]),
        );

        return new Set(
            participant.guesses
                .reduce((prev, curr) => {
                    const accumulator = [...prev];
                    const { mask, word } = curr;

                    if (mask && word) {
                        Array.from(mask).forEach((v, i) => {
                            if (v === '1') accumulator.push(word.charAt(i));
                        });
                    }

                    return accumulator;
                }, [] as string[])
                .filter(v => !lettersValid.has(v)),
        );
    }, [appUser, lobby]);

    const providerValue = useMemo(
        () => ({
            guess,
            appendLetter,
            backspace,
            onSubmit: handleSubmit,
            onReset: handleReset,
            isSubmittingGuess,
            disabledLetters,
            canGuess,
            wasGuessInvalid,
            guessKey,
            startStopwatch,
            pauseStopwatch,
        }),
        [
            guess,
            appendLetter,
            backspace,
            handleSubmit,
            handleReset,
            isSubmittingGuess,
            disabledLetters,
            canGuess,
            wasGuessInvalid,
            guessKey,
            startStopwatch,
            pauseStopwatch,
        ],
    );

    return <GuessInputContext.Provider value={providerValue}>{children}</GuessInputContext.Provider>;
}

export function useGuessInput() {
    const context = useContext(GuessInputContext);

    if (context === undefined) {
        throw new Error('useGuessInput must be used within a GuessInputProvider');
    }

    return context;
}
