import { useEffect } from 'react';
import * as RootNavigation from '@root/RootNavigation';
import * as Notifications from 'expo-notifications';

function NotificationHandler() {
    const lastNotificationResponse = Notifications.useLastNotificationResponse();

    useEffect(() => {
        if (
            lastNotificationResponse &&
            lastNotificationResponse.notification.request.content.data.joinKey &&
            lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
        ) {
            RootNavigation.navigate('Lobby', {
                joinKey: lastNotificationResponse.notification.request.content.data.joinKey,
            });
        }
    }, [lastNotificationResponse]);

    return null;
}

export default NotificationHandler;
