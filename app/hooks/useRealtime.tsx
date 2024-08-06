/* eslint-disable import/prefer-default-export */
import { WS_BASE } from '@env';
import { Lobby } from '@root/models';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import useAppState from 'react-native-appstate-hook';
import Toast from 'react-native-toast-message';
import { useDispatch, useGlobal } from 'reactn';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import useAppUser from './useAppUser';

export type WebSocketState = 'closed' | 'opening' | 'open' | 'reconnect';

interface IRealtimeContext {
    state: WebSocketState;
}

const RealtimeContextInitial: IRealtimeContext = {
    state: 'closed',
};

const RealtimeContext = React.createContext(RealtimeContextInitial);

interface Props {
    children: React.ReactNode;
}

const storeLobbyReducer = (lobbies: Lobby[], action: Lobby) => [
    ...lobbies.filter(l => l.joinKey !== action.joinKey),
    action,
];

const deleteLobbyReducer = (lobbies: Lobby[], action: string) => lobbies.filter(l => l.joinKey !== action);

export function RealtimeProvider({ children }: Props) {
    const { appUser, signOut } = useAppUser();
    const [, setWaitingForLobbyUpdate] = useGlobal('waitingForLobbyUpdate');
    const [wsState, setWsState] = useState<WebSocketState>('closed');
    const storeLobby = useDispatch(storeLobbyReducer, 'lobbies');
    const removeLobby = useDispatch(deleteLobbyReducer, 'lobbies');
    const [lobbies] = useGlobal('lobbies');
    const socketRef = useRef<WebSocket>();
    const consecutiveFailures = useRef(0);
    const isConnecting = useRef(false);
    const { appState } = useAppState();
    const readyLobbyCount = useMemo(() => lobbies.filter(l => l.status === 'ROUND_ACTIVE').length, [lobbies]);
    useEffect(() => {
        const updateBadge = async (count: number) => {
            const permissions = await Notifications.getPermissionsAsync();
            if (permissions.granted && (Platform.OS !== 'ios' || permissions.ios?.allowsBadge)) {
                await Notifications.setBadgeCountAsync(count);
            }
        };

        updateBadge(readyLobbyCount);
    }, [readyLobbyCount]);

    const { token } = appUser || {};

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        if (wsState !== 'reconnect') return () => {};

        if (!(appState === 'active' || appState === 'inactive')) {
            setWsState('closed');
            consecutiveFailures.current = 0;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => {};
        }

        const delay = Math.min(consecutiveFailures.current, 5) * (Math.random() * 2000);
        consecutiveFailures.current += 1;
        const timeout = setTimeout(() => setWsState(prev => (prev === 'reconnect' ? 'closed' : prev)), delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [wsState, appState]);

    useEffect(() => {
        const shouldOpen = wsState === 'closed' && (appState === 'active' || appState === 'inactive');
        const shouldClose = wsState !== 'closed' && !(appState === 'active' || appState === 'inactive');
        const isTokenReady = typeof token === 'string' && token.length > 0;

        if (shouldOpen && isTokenReady && !isConnecting.current && setWaitingForLobbyUpdate) {
            setWsState('opening');
            isConnecting.current = true;

            const handleOpen = () => {
                consecutiveFailures.current = 0;
                setWsState('open');
            };
            const handleClose = (event: WebSocketCloseEvent | WebSocketErrorEvent) => {
                setWsState('reconnect');

                if (event?.message) {
                    if (event.message.includes('received bad response code from server 401')) {
                        signOut();
                        return;
                    }

                    Sentry.captureMessage(event.message, Sentry.Severity.Error);
                }

                isConnecting.current = false;
            };
            const handleMessage = (evt: MessageEvent) => {
                const message = JSON.parse(evt.data as string);

                if (message.event === 'lobby') {
                    storeLobby(message.data);
                    setWaitingForLobbyUpdate(false);
                } else if (message.event === 'lobby_remove') {
                    removeLobby(message.data.joinKey);
                } else if (message.event === 'lobby_empty') {
                    setWaitingForLobbyUpdate(false);
                } else if (message.event === 'participant_done') {
                    Toast.show({
                        type: 'user-avatar',
                        text1: message.data.userName,
                        text2: message.data.message,
                        position: 'top',
                        props: {
                            userAvatarId: message.data.targetUserId,
                        },
                    });
                }
            };

            socketRef.current = new WebSocket(`${WS_BASE}/?token=${token}`);
            socketRef.current.onopen = handleOpen;
            socketRef.current.onclose = handleClose;
            socketRef.current.onerror = handleClose;
            socketRef.current.onmessage = handleMessage;
            setWaitingForLobbyUpdate(true);
        }

        if (shouldClose && socketRef.current) {
            socketRef.current.close();
            socketRef.current = undefined;
        }
    }, [wsState, storeLobby, removeLobby, token, appState, setWaitingForLobbyUpdate, signOut]);

    const value = useMemo(() => ({ state: wsState }), [wsState]);

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
    const context = useContext(RealtimeContext);

    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }

    return context;
}
