/* eslint-disable no-console */
import { CustomLobbyGameRules, Lobby, LobbyCreateResult } from '@root/models';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGlobal } from 'reactn';
import * as Sentry from '@sentry/react-native';
import useAxios from './useAxios';
import useAppUser from './useAppUser';

export default function useLobbyList() {
    const axios = useAxios();
    const [lobbies, setLobbyList] = useGlobal('lobbies');
    const { appUser } = useAppUser();
    const [waitingForLobbyUpdate, setWaitingForLobbyUpdate] = useGlobal('waitingForLobbyUpdate');
    const [isRefreshingLobbies, setIsRefreshingLobbies] = useState(false);
    const refreshRequested = useRef(false);
    const manualRefresh = useRef(false);
    const token = appUser?.token;

    const refreshLobbies = useCallback(
        async (isManual = false) => {
            if (axios && !refreshRequested.current) {
                manualRefresh.current = isManual;
                refreshRequested.current = true;
                manualRefresh.current = false;

                try {
                    console.debug('Refreshing lobbies, isManual=', isManual);
                    setIsRefreshingLobbies(true);
                    setWaitingForLobbyUpdate(true);
                    await axios.get<Lobby[]>('/lobbies');
                } catch (err) {
                    Sentry.captureException(err);
                }

                refreshRequested.current = false;
                manualRefresh.current = false;
                setIsRefreshingLobbies(false);
            } else {
                console.debug(
                    'Skipping refresh request, axios=',
                    !!axios,
                    'refreshRequested=',
                    refreshRequested.current,
                );
            }
        },
        [axios, setWaitingForLobbyUpdate],
    );

    const createLobby = useCallback(
        async (gameRules: CustomLobbyGameRules, name: string) => {
            if (!axios) {
                console.warn('Attempted to create a game when not Axios is not ready');
                return undefined;
            }

            try {
                console.debug('Creating lobby gameRules=', gameRules);
                const result = await axios.post<LobbyCreateResult>('/lobbies/custom', {
                    gameMode: 'custom',
                    tz: 'America/New_York',
                    gameRules,
                    name,
                });
                return result.data.joinKey;
            } catch (err) {
                Sentry.captureException(err);
                return undefined;
            }
        },
        [axios],
    );

    const joinLobby = useCallback(
        async (joinKey: string) => {
            if (!axios) {
                console.warn('Attempted to join a game when not Axios is not ready');
                return false;
            }

            try {
                console.debug('Joining lobby joinKey=', joinKey);
                await axios.post<LobbyCreateResult>(`/lobbies/${joinKey}/users`);
                return true;
            } catch (err) {
                Sentry.captureException(err);
                return false;
            }
        },
        [axios],
    );

    const canJoin = useMemo(() => !!axios, [axios]);

    useEffect(() => {
        if (!token) {
            setLobbyList([]);
        }
    }, [token, setLobbyList]);

    return {
        canJoin,
        isRefreshingLobbies,
        isManualRefresh: manualRefresh.current || waitingForLobbyUpdate,
        waitingForLobbyUpdate,
        refreshLobbies,
        createLobby,
        joinLobby,
        lobbies,
    };
}
