import { API_BASE } from '@env';
import axios, { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import { useGlobal } from 'reactn';

export default function useAxios(requireAuthed = true) {
    const [appUser] = useGlobal('appUser');
    const { token } = appUser || {};
    const [instance, setInstance] = useState<AxiosInstance>();

    const isSet = !!instance;
    const isAuthed = isSet && instance.defaults?.headers?.common?.Authorization === token;

    useEffect(() => {
        const baseURL = API_BASE;

        if (requireAuthed && !isAuthed && token) {
            const headers = { Authorization: token };
            setInstance(() => axios.create({ baseURL, headers }));
        } else if (!requireAuthed && (isAuthed || !isSet)) {
            setInstance(() => axios.create({ baseURL }));
        }
    }, [token, requireAuthed, isSet, isAuthed]);

    return instance;
}
