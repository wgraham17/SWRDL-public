import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import * as RootNavigation from '@root/RootNavigation';

function AuthedDeepLinkHandler() {
    useEffect(() => {
        const handler = ({ url }: Linking.EventType) => {
            const joinMatch1 = /https:\/\/(?:www\.)?swrdl\.app\/j\/(\d{7})/g.exec(url);
            const joinMatch2 = /swrdl:\/\/join\/(\d{7})/g.exec(url);
            const joinMatch = joinMatch1 || joinMatch2;

            if (joinMatch) {
                const joinKey = joinMatch[1];
                RootNavigation.navigate('JoinGame', { joinKey });
                return;
            }

            const recoverySetupMatch1 = /https:\/\/(?:www\.)?swrdl\.app\/s\/([A-Za-z0-9\-_]+)/g.exec(url);
            const recoverySetupMatch2 = /swrdl:\/\/setup-recovery\/([A-Za-z0-9\-_]+)/g.exec(url);
            const recoverySetupMatch = recoverySetupMatch1 || recoverySetupMatch2;

            if (recoverySetupMatch) {
                const token = recoverySetupMatch[1];
                RootNavigation.navigate('RecoverySetupComplete', { token });
                return;
            }

            // eslint-disable-next-line no-console
            console.log('unhandled url', url);
        };

        Linking.getInitialURL().then(url => {
            if (url) handler({ url });
        });

        const sub = Linking.addEventListener('url', handler);
        return () => sub.remove();
    }, []);

    return null;
}

export default AuthedDeepLinkHandler;
