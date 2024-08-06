import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { enableFreeze, enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useMemo } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { LogBox, StatusBar, useColorScheme } from 'react-native';
import { setGlobal } from 'reactn';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from 'sentry-expo';
import ThemedToaster from '@components/ThemedToaster';
import * as Notifications from 'expo-notifications';
import * as RootNavigation from './RootNavigation';
import customTheme from './custom-theme';
import AppRootContainer from './AppRootContainer';
import AnimatedAppLoader from './AnimatedAppLoader';

Sentry.init({
    dsn: 'https://137c7eed8dbc4dbdb15b7534da61f1e5@o1266297.ingest.sentry.io/6451297',
    tracesSampleRate: 0.25,
});

enableFreeze();
enableScreens();

SplashScreen.preventAutoHideAsync().catch(() => {
    // no-op
});

setGlobal({
    hasCompletedOnboarding: false,
    avatarMap: {},
    userInfoMap: {},
    lobbies: [],
    createdLobbyKey: '',
    waitingForLobbyUpdate: true,
    notificationsEnabled: false,
    hasNotificationPrompted: false,
    needsWelcomePrompt: false,
    recoveryEnabled: false,
    lobbyAvatars: {},
});

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export default function App() {
    const colorScheme = useColorScheme();
    const theme = useMemo(
        () => ({
            ...(colorScheme === 'light' ? eva.light : eva.dark),
            ...customTheme,
        }),
        [colorScheme],
    );
    const barStyle = useMemo(() => (colorScheme === 'light' ? 'dark-content' : 'light-content'), [colorScheme]);
    const barBgColor = useMemo(() => (colorScheme === 'light' ? '#ffffff' : '#000000'), [colorScheme]);

    useEffect(() => {
        LogBox.ignoreLogs([
            'ViewPropTypes will be removed from React Native',
            '`setBackgroundColor` is only available on Android',
        ]);
    }, []);

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(colorScheme === 'light' ? '#ffffff' : '#000000');
        StatusBar.setBackgroundColor(colorScheme === 'light' ? '#ffffff' : '#000000');
        StatusBar.setBarStyle(colorScheme === 'light' ? 'dark-content' : 'light-content');
    }, [colorScheme]);

    return (
        <AnimatedAppLoader>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ApplicationProvider {...eva} theme={theme}>
                    <IconRegistry icons={EvaIconsPack} />
                    <SafeAreaProvider style={{ flex: 1 }}>
                        <StatusBar backgroundColor={barBgColor} barStyle={barStyle} />
                        <NavigationContainer ref={RootNavigation.navigationRef}>
                            <AppRootContainer />
                        </NavigationContainer>
                        <ThemedToaster />
                    </SafeAreaProvider>
                </ApplicationProvider>
            </GestureHandlerRootView>
        </AnimatedAppLoader>
    );
}
