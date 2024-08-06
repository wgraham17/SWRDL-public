/* eslint-disable no-console */
import { Lobby, SubmitGuessRequest, SubmitGuessResult, SubmitWordRequest } from '@root/models';
import { useTheme } from '@ui-kitten/components';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Platform, Share } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Sentry from '@sentry/react-native';
import { useDispatch } from 'reactn';
import useAxios from './useAxios';
import useLobbyList from './useLobbyList';

const deleteLobbyReducer = (lobbies: Lobby[], action: string) => lobbies.filter(l => l.joinKey !== action);

// eslint-disable-next-line @typescript-eslint/no-empty-function
const asyncNoop = (): Promise<any> =>
    new Promise(resolve => {
        resolve(undefined);
    });

interface ILobbyContext {
    lobby: Lobby | undefined;
    startGame: () => Promise<void>;
    endGame: () => Promise<void>;
    leaveGame: () => Promise<void>;
    isStartingGame: boolean;
    isEndingGame: boolean;
    isLeavingGame: boolean;
    submitGuess: (_: SubmitGuessRequest) => Promise<SubmitGuessResult | undefined>;
    isSubmittingGuess: boolean;
    submitWord: (_: SubmitWordRequest) => Promise<void>;
    isSubmittingWord: boolean;
    shareInvite: () => Promise<void>;
    submitInvalidWord: (_: string) => Promise<void>;
}

const LobbyContextInitial: ILobbyContext = {
    lobby: undefined,
    startGame: asyncNoop,
    endGame: asyncNoop,
    leaveGame: asyncNoop,
    isStartingGame: false,
    isEndingGame: false,
    isLeavingGame: false,
    submitGuess: asyncNoop,
    isSubmittingGuess: false,
    submitWord: asyncNoop,
    isSubmittingWord: false,
    shareInvite: asyncNoop,
    submitInvalidWord: asyncNoop,
};

const LobbyContext = React.createContext<ILobbyContext>(LobbyContextInitial);

interface Props {
    children: React.ReactNode;
    joinKey: string;
}

export function LobbyProvider({ children, joinKey }: Props) {
    const primaryColor = useTheme()['color-primary-500'];
    const { lobbies } = useLobbyList();
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [isEndingGame, setIsEndingGame] = useState(false);
    const [isLeavingGame, setIsLeavingGame] = useState(false);
    const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
    const [isSubmittingWord, setIsSubmittingWord] = useState(false);
    const removeLobby = useDispatch(deleteLobbyReducer, 'lobbies');
    const lobby = useMemo(() => lobbies.find(l => l.joinKey === joinKey), [joinKey, lobbies]);
    const axios = useAxios();

    const startGame = useCallback(async () => {
        if (!axios || !joinKey) {
            console.warn('Attempted to start a game when not ready, axios', !!axios, 'joinKey', !!joinKey);
            return;
        }

        setIsStartingGame(true);

        try {
            console.debug('Starting game', joinKey);
            await axios.post(`/lobbies/${joinKey}/start`);
        } catch (err) {
            Sentry.captureException(err);
            Toast.show({
                type: 'error',
                text1: 'Problem Starting Game',
                text2: 'We had a problem starting the game. Please try again.',
            });
        } finally {
            setIsStartingGame(false);
        }
    }, [axios, joinKey]);

    const endGame = useCallback(async () => {
        if (!axios || !joinKey) {
            console.warn('Attempted to end a game when not ready, axios', !!axios, 'joinKey', !!joinKey);
            return;
        }

        setIsEndingGame(true);

        try {
            console.debug('Ending the game', joinKey);
            await axios.delete(`/lobbies/${joinKey}`);
        } catch (err) {
            Sentry.captureException(err);
        } finally {
            setIsEndingGame(false);
        }
    }, [axios, joinKey]);

    const leaveGame = useCallback(async () => {
        if (!axios || !joinKey) {
            console.warn('Attempted to leave a game when not ready, axios', !!axios, 'joinKey', !!joinKey);
            return;
        }

        setIsLeavingGame(true);

        try {
            console.debug('Leaving the game', joinKey);
            await axios.delete(`/lobbies/${joinKey}/users/_self`);
            setTimeout(() => removeLobby(joinKey), 100);
        } catch (err) {
            Sentry.captureException(err);
        } finally {
            setIsLeavingGame(false);
        }
    }, [axios, joinKey, removeLobby]);

    const shareInvite = useCallback(async () => {
        const joinUrl = `https://swrdl.app/j/${joinKey}`;
        let shareMessage = `Join my game on SWRDL!`;

        if (Platform.OS !== 'ios') {
            shareMessage += ` ${joinUrl}`;
        }

        await Share.share(
            {
                message: shareMessage,
                url: joinUrl,
            },
            {
                dialogTitle: 'Share Invite Link',
                tintColor: primaryColor,
            },
        );
    }, [joinKey, primaryColor]);

    const submitGuess = useCallback(
        async (guess: SubmitGuessRequest) => {
            if (!axios || !lobby) {
                console.warn('Attempted to submit a guess when not ready, axios', !!axios, 'lobby', !!lobby);
                return undefined;
            }

            setIsSubmittingGuess(true);
            console.debug('Submitting guess from useLobby hook');
            const result = await axios.post<SubmitGuessResult>(`/lobbies/${lobby.joinKey}/guesses`, guess);
            setIsSubmittingGuess(false);

            return result.data;
        },
        [axios, lobby],
    );

    const submitInvalidWord = useCallback(
        async (guess: string) => {
            if (!axios || !lobby) {
                console.warn('Attempted to submit an invalid word when not ready, axios', !!axios, 'lobby', !!lobby);
                return;
            }

            await axios.post(`/lobbies/${lobby.joinKey}/invalidWords`, { guess });
        },
        [axios, lobby],
    );

    const submitWord = useCallback(
        async (word: SubmitWordRequest) => {
            if (!axios || !lobby) {
                console.warn('Attempted to submit a word when not ready, axios', !!axios, 'lobby', !!lobby);
                return;
            }

            setIsSubmittingWord(true);
            await axios.put(`/lobbies/${lobby.joinKey}/word`, word);
            setIsSubmittingWord(false);
        },
        [axios, lobby],
    );

    const providerValue = useMemo(
        () => ({
            lobby,
            startGame,
            endGame,
            leaveGame,
            isStartingGame,
            isEndingGame,
            isLeavingGame,
            submitGuess,
            isSubmittingGuess,
            submitWord,
            isSubmittingWord,
            shareInvite,
            submitInvalidWord,
        }),
        [
            lobby,
            startGame,
            endGame,
            leaveGame,
            isStartingGame,
            isEndingGame,
            isLeavingGame,
            submitGuess,
            isSubmittingGuess,
            submitWord,
            isSubmittingWord,
            shareInvite,
            submitInvalidWord,
        ],
    );

    return <LobbyContext.Provider value={providerValue}>{children}</LobbyContext.Provider>;
}

export function useLobby() {
    const context = useContext(LobbyContext);

    if (typeof context === 'undefined') {
        throw new Error('useGuessInput must be used within a GuessInputProvider');
    }

    return context;
}
