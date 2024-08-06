import AuthedDeepLinkHandler from '@components/AuthedDeepLinkHandler';
import NotificationHandler from '@components/NotificationHandler';
import { RealtimeProvider } from '@hooks/useRealtime';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthedStackParamList } from './AuthedStackParamList';
import CreateGameScreen from './CreateGameScreen';
import DemoScreen from './DemoScreen';
import EndGameScreen from './EndGameScreen';
import HomeScreen from './HomeScreen';
import HowToPlayScreen from './HowToPlayScreen';
import JoinGameScreen from './JoinGameScreen';
import LobbyScreen from './LobbyScreen';
import LobbyStatsScreen from './LobbyStatsScreen';
import RecoverySetupCompleteScreen from './RecoverySetupCompleteScreen';
import RoundScreen from './RoundScreen';
import SettingsStack from './SettingsStack';

const { Navigator, Screen } = createNativeStackNavigator<AuthedStackParamList>();

function AuthedStack() {
    return (
        <RealtimeProvider>
            <Navigator screenOptions={{ headerShown: false }}>
                <Screen name="Home" component={HomeScreen} />
                <Screen name="CreateGame" component={CreateGameScreen} options={{ presentation: 'modal' }} />
                <Screen name="JoinGame" component={JoinGameScreen} options={{ presentation: 'modal' }} />
                <Screen name="Lobby" component={LobbyScreen} />
                <Screen name="LobbyStats" component={LobbyStatsScreen} options={{ presentation: 'modal' }} />
                <Screen name="Round" component={RoundScreen} />
                <Screen name="Settings" component={SettingsStack} options={{ presentation: 'modal' }} />
                <Screen name="EndGame" component={EndGameScreen} options={{ presentation: 'modal' }} />
                <Screen name="Demo" component={DemoScreen} />
                <Screen name="HowToPlayOffer" component={HowToPlayScreen} options={{ presentation: 'modal' }} />
                <Screen
                    name="RecoverySetupComplete"
                    component={RecoverySetupCompleteScreen}
                    options={{ presentation: 'modal' }}
                />
            </Navigator>
            <AuthedDeepLinkHandler />
            <NotificationHandler />
        </RealtimeProvider>
    );
}

export default AuthedStack;
