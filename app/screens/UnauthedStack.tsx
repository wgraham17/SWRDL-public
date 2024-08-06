import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@screens/WelcomeScreen';
import CreateAccountScreen from '@screens/CreateAccountScreen';
import UnauthedDeepLinkHandler from '@components/UnauthedDeepLinkHandler';
import { UnauthedStackParamList } from './UnauthedStackParamList';
import RecoverScreen from './RecoverScreen';
import RecoverCompleteScreen from './RecoverCompleteScreen';

const { Navigator, Screen } = createNativeStackNavigator<UnauthedStackParamList>();

function UnauthedStack() {
    return (
        <>
            <Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Screen name="Welcome" component={WelcomeScreen} />
                <Screen name="CreateAccount" component={CreateAccountScreen} />
                <Screen name="Recover" component={RecoverScreen} />
                <Screen name="RecoverComplete" component={RecoverCompleteScreen} options={{ presentation: 'modal' }} />
            </Navigator>
            <UnauthedDeepLinkHandler />
        </>
    );
}

export default UnauthedStack;
