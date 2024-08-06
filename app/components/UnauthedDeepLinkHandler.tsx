import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import * as RootNavigation from '@root/RootNavigation';

function UnauthedDeepLinkHandler() {
    useEffect(() => {
        const handler = ({ url }: Linking.EventType) => {
            const recoveryMatch1 = /https:\/\/(?:www\.)?swrdl\.app\/r\/([A-Za-z0-9\-_]+)/g.exec(url);
            const recoveryMatch2 = /swrdl:\/\/recover\/([A-Za-z0-9\-_]+)/g.exec(url);
            const recoveryMatch = recoveryMatch1 || recoveryMatch2;

            if (recoveryMatch) {
                const token = recoveryMatch[1];
                RootNavigation.navigate('RecoverComplete', { token });
                return;
            }

            // eslint-disable-next-line no-console
            console.warn('unhandled url', url);
        };

        Linking.getInitialURL().then(url => {
            if (url) handler({ url });
        });

        const sub = Linking.addEventListener('url', handler);
        return () => sub.remove();
    }, []);

    return null;
}

export default UnauthedDeepLinkHandler;
