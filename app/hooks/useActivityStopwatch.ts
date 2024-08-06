import { useCallback, useEffect, useRef, useState } from 'react';
import useAppState from 'react-native-appstate-hook';

export default function useActivityStopwatch() {
    const currentStartTime = useRef<number>();
    const [elapsed, setElapsed] = useState(0);
    const { appState } = useAppState();

    const startStopwatch = useCallback(() => {
        currentStartTime.current = new Date().getTime();
    }, []);

    const pauseStopwatch = useCallback(() => {
        const lastStart = currentStartTime.current;

        if (typeof lastStart === 'number') {
            setElapsed(v => v + (new Date().getTime() - lastStart));
        }

        currentStartTime.current = undefined;
    }, []);

    const stopStopwatch = useCallback(() => {
        const lastStart = currentStartTime.current;
        let result = elapsed;

        if (typeof lastStart === 'number') {
            result += new Date().getTime() - lastStart;
        }

        setElapsed(0);
        currentStartTime.current = undefined;

        return result;
    }, [elapsed]);

    useEffect(() => {
        if (appState === 'active') {
            currentStartTime.current = new Date().getTime();
        } else {
            pauseStopwatch();
        }
    }, [appState, pauseStopwatch]);

    return { startStopwatch, stopStopwatch, pauseStopwatch };
}
