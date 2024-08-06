import { useEffect, useRef } from 'react';
import { useDispatch, useGlobal } from 'reactn';
import useAxios from './useAxios';

type DispatchArgs = { id: string; xml: string };
type ReturnType = { isLoaded: true; xml: string } | { isLoaded: false };

export default function useLobbyAvatar(joinKey?: string | undefined): ReturnType {
    const [lobbyAvatars] = useGlobal('lobbyAvatars');
    const cacheAvatar = useDispatch((global, _dispatch, { id, xml }: DispatchArgs) => ({
        lobbyAvatars: { ...global.lobbyAvatars, [id]: xml },
    }));
    const cachedAvatar = lobbyAvatars[joinKey || ''] || null;
    const isRequesting = useRef(false);
    const axios = useAxios();

    const isLoaded = !!cachedAvatar;

    useEffect(() => {
        if (isLoaded || isRequesting.current) return;

        if (axios && joinKey && !isLoaded) {
            isRequesting.current = true;

            const loadData = async () => {
                const result = await axios.get<string>(`/lobbies/${joinKey}/avatar`);
                cacheAvatar({ id: joinKey, xml: result.data });
                isRequesting.current = false;
            };

            loadData();
        }
    }, [axios, joinKey, isLoaded, cacheAvatar]);

    if (cachedAvatar) {
        return { isLoaded, xml: cachedAvatar };
    }

    return { isLoaded: false };
}
