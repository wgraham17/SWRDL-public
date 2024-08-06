import { useEffect, useRef } from 'react';
import { useDispatch, useGlobal } from 'reactn';
import useAxios from './useAxios';

type DispatchArgs = { id: string; xml: string };
type ReturnType = { isLoaded: true; xml: string } | { isLoaded: false };

export default function useUserAvatar(userId?: string | undefined): ReturnType {
    const [avatarMap] = useGlobal('avatarMap');
    const cacheAvatar = useDispatch((global, _dispatch, { id, xml }: DispatchArgs) => ({
        avatarMap: { ...global.avatarMap, [id]: xml },
    }));
    const cachedAvatar = avatarMap[userId || ''] || null;
    const isRequesting = useRef(false);
    const axios = useAxios();

    const isLoaded = !!cachedAvatar;

    useEffect(() => {
        if (isLoaded || isRequesting.current) return;

        if (axios && userId && !isLoaded) {
            isRequesting.current = true;

            const loadData = async () => {
                const result = await axios.get<string>(`/users/${userId}/avatar`);
                cacheAvatar({ id: userId, xml: result.data });
                isRequesting.current = false;
            };

            loadData();
        }
    }, [axios, userId, isLoaded, cacheAvatar]);

    if (cachedAvatar) {
        return { isLoaded, xml: cachedAvatar };
    }

    return { isLoaded: false };
}
