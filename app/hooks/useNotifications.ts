import { TOKEN_EXPERIENCE_ID } from '@env';
import * as Sentry from '@sentry/react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { useGlobal } from 'reactn';
import useAxios from './useAxios';

const isGranted = (val: Notifications.NotificationPermissionsStatus) =>
    val.granted || val.status === 'granted' || val.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

export default function useNotifications() {
    const axios = useAxios();
    const [notificationsEnabled, setNotificationsEnabled] = useGlobal('notificationsEnabled');
    const [hasNotificationPrompted, setHasNotificationPrompted] = useGlobal('hasNotificationPrompted');
    const [isUpdating, setIsUpdating] = useState(false);
    const isRecoveringNotifications = useRef(false);

    const enableNotifications = useCallback(async () => {
        if (!Device.isDevice || !axios) return;

        setIsUpdating(true);
        setHasNotificationPrompted(true);
        const permissions = await Notifications.getPermissionsAsync();

        if (!isGranted(permissions)) {
            const promptResult = await Notifications.requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true,
                },
            });

            if (!isGranted(promptResult)) {
                setNotificationsEnabled(false);
                // eslint-disable-next-line no-alert
                alert('Please enable notifications for SWRDL in your device settings.');
                setIsUpdating(false);
                return;
            }
        }

        try {
            const token = await Notifications.getExpoPushTokenAsync({
                experienceId: TOKEN_EXPERIENCE_ID,
            });
            await axios.put(`/users/_self/preferences`, {
                notifications: {
                    enabled: true,
                    token: token.data,
                    prompted: true,
                },
            });

            setNotificationsEnabled(true);
        } catch (err) {
            Sentry.captureException(err);
            Toast.show({
                type: 'error',
                text1: 'Notifications Error',
                text2: 'We had a problem turning on notifications for you. Please try again shortly.',
            });
            setNotificationsEnabled(false);
        } finally {
            setIsUpdating(false);
        }
    }, [axios, setNotificationsEnabled, setHasNotificationPrompted]);

    const disableNotifications = useCallback(async () => {
        if (!Device.isDevice || !axios) return;

        setIsUpdating(true);
        setHasNotificationPrompted(true);

        try {
            await axios.put(`/users/_self/preferences`, {
                notifications: {
                    enabled: false,
                    prompted: true,
                },
            });

            setNotificationsEnabled(false);
        } catch (err) {
            Sentry.captureException(err);
            Toast.show({
                type: 'error',
                text1: 'Notifications Error',
                text2: 'We had a problem turning off notifications for you. Please try again shortly.',
            });
            setNotificationsEnabled(true);
        } finally {
            setIsUpdating(false);
        }
    }, [axios, setNotificationsEnabled, setHasNotificationPrompted]);

    const promptNotifications = useCallback(() => {
        Alert.alert(
            'Turn On Notifications',
            'SWRDL can let you know when a word is ready to play.\r\n\r\nDo you want to turn on push notifications?',
            [
                { text: 'Maybe Later', onPress: disableNotifications },
                { text: 'Sounds Great', onPress: enableNotifications },
            ],
        );
    }, [enableNotifications, disableNotifications]);

    // Check to make sure notifications are enabled in the OS (in case of Account Recovery/etc)
    useEffect(() => {
        const verifyPermissions = async () => {
            isRecoveringNotifications.current = true;

            try {
                const permissions = await Notifications.getPermissionsAsync();

                if (!isGranted(permissions) && permissions.canAskAgain) {
                    const promptResult = await Notifications.requestPermissionsAsync({
                        ios: {
                            allowAlert: true,
                            allowBadge: true,
                            allowSound: true,
                        },
                    });

                    if (!isGranted(promptResult)) {
                        setNotificationsEnabled(false);
                        // eslint-disable-next-line no-alert
                        alert('Please enable notifications for SWRDL in your device settings.');
                    }
                }
            } finally {
                isRecoveringNotifications.current = false;
            }
        };

        if (notificationsEnabled && !isRecoveringNotifications.current) verifyPermissions();
    }, [notificationsEnabled, setNotificationsEnabled, enableNotifications]);

    return {
        isUpdating,
        notificationsEnabled,
        hasNotificationPrompted,
        enableNotifications,
        disableNotifications,
        promptNotifications,
    };
}
