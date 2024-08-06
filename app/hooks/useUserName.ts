import { UserInfo } from '@root/models';
import { useEffect, useRef } from 'react';
import { useDispatch, useGlobal } from 'reactn';
import * as Sentry from '@sentry/react-native';
import useAxios from './useAxios';

type DispatchArgs = { id: string; user: UserInfo };
type ReturnType = { isLoaded: true; name: string } | { isLoaded: false };

export default function useUserName(userId?: string | undefined): ReturnType {
    const [userInfoMap] = useGlobal('userInfoMap');
    const cache = useDispatch((global, _dispatch, { id, user }: DispatchArgs) => ({
        userInfoMap: { ...global.userInfoMap, [id]: user },
    }));
    const cachedValue = userInfoMap[userId || ''];
    const isRequesting = useRef(false);
    const axios = useAxios();

    const isLoaded = !!cachedValue;

    useEffect(() => {
        if (isLoaded || isRequesting.current) return;

        if (axios && userId && !isLoaded) {
            isRequesting.current = true;

            const loadData = async () => {
                try {
                    const result = await axios.get<UserInfo>(`/users/${userId}`);
                    cache({ id: userId, user: result.data });
                } catch (err) {
                    Sentry.captureException(err);
                }
                isRequesting.current = false;
            };

            loadData();
        }
    }, [axios, userId, isLoaded, cachedValue, cache]);

    if (cachedValue) {
        return { isLoaded, name: cachedValue.name };
    }

    return { isLoaded: false };
}
