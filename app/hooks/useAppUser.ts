/* eslint-disable no-console */
import * as SecureStore from 'expo-secure-store';
import { UserAuthResponse, UserCredentials } from '@root/models';
import * as Sentry from '@sentry/react-native';
import { useCallback, useRef, useState } from 'react';
import { useGlobal } from 'reactn';
import { AxiosError } from 'axios';
import { Alert } from 'react-native';
import useAxios from './useAxios';

export default function useAppUser() {
    const [appUser, setAppUser] = useGlobal('appUser');
    const [, setHasNotificationPrompted] = useGlobal('hasNotificationPrompted');
    const [, setNotificationsEnabled] = useGlobal('notificationsEnabled');
    const [, setRecoveryEnabled] = useGlobal('recoveryEnabled');
    const [needsWelcomePrompt, setNeedsWelcomePrompt] = useGlobal('needsWelcomePrompt');
    const [isRestoringUser, setIsRestoringUser] = useState(false);
    const isRegisteringUser = useRef(false);
    const axios = useAxios(false);

    const isReady =
        axios && !!setAppUser && !!setNotificationsEnabled && !!setHasNotificationPrompted && !!setRecoveryEnabled;

    const restoreUser = useCallback(async () => {
        console.debug('restoring user isReady=', isReady);

        if (isReady) {
            setIsRestoringUser(true);

            try {
                console.debug('Attempting to restore user token from storage');
                const persisted = await SecureStore.getItemAsync('token');

                if (persisted) {
                    console.debug('Verifying persisted token against API');
                    const result = await axios.get<UserAuthResponse>(`/users/auth`, {
                        headers: { Authorization: persisted },
                    });

                    console.debug('Success! Restoring token');
                    setAppUser({
                        id: result.data.id,
                        name: result.data.name,
                        token: result.data.token,
                    });
                    setNotificationsEnabled(result.data.notificationsEnabled);
                    setHasNotificationPrompted(result.data.notificationsPrompted);
                    setRecoveryEnabled(result.data.recoveryEnabled);
                }
            } catch (err: any) {
                if (err.isAxiosError) {
                    const axiosError = err as AxiosError;
                    if (
                        axiosError.response?.status === 400 ||
                        axiosError.response?.status === 404 ||
                        axiosError.response?.status === 401 ||
                        axiosError.response?.status === 403
                    ) {
                        console.debug('Seems to be an error related to the token being invalid, deleting stored token');
                        await SecureStore.deleteItemAsync('token');
                    }
                }
                console.error(err);
                Sentry.captureException(err);
            } finally {
                setIsRestoringUser(false);
            }

            return true;
        }

        return false;
    }, [isReady, axios, setAppUser, setNotificationsEnabled, setHasNotificationPrompted, setRecoveryEnabled]);

    const registerUser = useCallback(async () => {
        if (!isReady || isRegisteringUser.current) return;

        isRegisteringUser.current = true;

        try {
            console.debug('Attempting to create a new user');
            const user = await axios.post<UserCredentials>(`/users`);
            await SecureStore.setItemAsync('token', user.data.token);

            setNeedsWelcomePrompt(true);
            setAppUser(user.data);
            setNotificationsEnabled(false);
            setHasNotificationPrompted(false);
            setRecoveryEnabled(false);
        } catch (err) {
            Sentry.captureException(err);
            throw new Error('Problem registering user');
        }

        isRegisteringUser.current = false;
    }, [
        isReady,
        axios,
        setNeedsWelcomePrompt,
        setAppUser,
        setNotificationsEnabled,
        setHasNotificationPrompted,
        setRecoveryEnabled,
    ]);

    const handleRecoveredToken = useCallback(
        async (token: string) => {
            if (isReady) {
                try {
                    const result = await axios.get<UserAuthResponse>(`/users/auth`, {
                        headers: { Authorization: token },
                    });

                    console.debug('Success! Saving token');
                    await SecureStore.setItemAsync('token', result.data.token);
                    setAppUser({
                        id: result.data.id,
                        name: result.data.name,
                        token: result.data.token,
                    });
                    setNotificationsEnabled(result.data.notificationsEnabled);
                    setHasNotificationPrompted(result.data.notificationsPrompted);
                    setRecoveryEnabled(result.data.recoveryEnabled);
                } catch (err: any) {
                    console.error(err);
                    Sentry.captureException(err);
                }
            }
        },
        [axios, isReady, setAppUser, setHasNotificationPrompted, setNotificationsEnabled, setRecoveryEnabled],
    );

    const offerWelcomePrompt = useCallback(() => {
        return new Promise<boolean>(resolve => {
            Alert.alert(
                'Welcome to SWRDL',
                'Welcome to SWRDL, the social word game! Do you want a quick intro on how to play?\r\n\r\nIf not, you can always get help in the Settings menu.',
                [
                    { text: 'Not Now', onPress: () => resolve(false) },
                    { text: 'Sure', onPress: () => resolve(true) },
                ],
            );
            setNeedsWelcomePrompt(false);
        });
    }, [setNeedsWelcomePrompt]);

    const signOut = useCallback(() => {
        setAppUser(undefined);
    }, [setAppUser]);

    return {
        appUser,
        isReady,
        registerUser,
        restoreUser,
        offerWelcomePrompt,
        needsWelcomePrompt,
        handleRecoveredToken,
        signOut,
        isRestoringUser,
    };
}
