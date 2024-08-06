/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import dictionary from '@root/data/dictionary';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useLobby } from './useLobby';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
const updateNoop = (_: string) => {};
const SetupWordInputContextInitial = {
    word: '',
    appendLetter: updateNoop,
    backspace: noop,
    onSubmit: noop,
    onReset: noop,
    isSubmittingWord: false,
    wasNotAWord: false,
};

const SetupWordInputContext = React.createContext(SetupWordInputContextInitial);
const DictionaryLookup = new Set(dictionary.map(d => d.toUpperCase()));

interface Props {
    children: React.ReactNode;
    navigation: NativeStackNavigationProp<AuthedStackParamList>;
}

export function SetupWordInputProvider({ navigation, children }: Props) {
    const { submitWord, isSubmittingWord } = useLobby();
    const [word, setWord] = useState('');
    const [wasNotAWord, setWasNotAWord] = useState(false);
    const appendLetter = useCallback((val: string) => setWord(g => `${g}${val}`.slice(0, 5)), []);
    const backspace = useCallback(() => setWord(g => `${g}`.slice(0, -1)), []);

    const handleSubmit = useCallback(async () => {
        setWasNotAWord(false);

        if (!DictionaryLookup.has(word.toUpperCase())) {
            setTimeout(() => setWasNotAWord(true), 0);
            return;
        }

        await submitWord({ word });
        setWord('');
        Toast.show({
            type: 'success',
            text1: 'Your word for the round was accepted!',
        });
        navigation.pop();
    }, [submitWord, word, navigation]);

    const handleReset = useCallback(() => setWord(''), []);

    const providerValue = useMemo(
        () => ({
            word,
            appendLetter,
            backspace,
            onSubmit: handleSubmit,
            onReset: handleReset,
            isSubmittingWord,
            wasNotAWord,
        }),
        [word, appendLetter, backspace, handleSubmit, handleReset, isSubmittingWord, wasNotAWord],
    );

    return <SetupWordInputContext.Provider value={providerValue}>{children}</SetupWordInputContext.Provider>;
}

export function useSetupWordInput() {
    const context = useContext(SetupWordInputContext);

    if (context === undefined) {
        throw new Error('useGuessInput must be used within a GuessInputProvider');
    }

    return context;
}
