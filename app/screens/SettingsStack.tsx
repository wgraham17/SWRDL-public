import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { memo } from 'react';
import HowToPlayScreen from './HowToPlayScreen';
import PrivacyScreen from './PrivacyScreen';
import RecoverySetupScreen from './RecoverySetupScreen';
import SettingsMainScreen from './SettingsMainScreen';
import { SettingsStackParamList } from './SettingsStackParamList';
import ThirdPartySoftwareScreen from './ThirdPartySoftwareScreen';

const { Navigator, Screen } = createNativeStackNavigator<SettingsStackParamList>();

function SettingsStack() {
    return (
        <Navigator screenOptions={{ headerShown: false }}>
            <Screen name="Main" component={SettingsMainScreen} />
            <Screen name="HowToPlay" component={HowToPlayScreen} initialParams={{ fromSettings: true }} />
            <Screen name="RecoverySetup" component={RecoverySetupScreen} />
            <Screen name="Privacy" component={PrivacyScreen} />
            <Screen name="ThirdPartySoftware" component={ThirdPartySoftwareScreen} />
        </Navigator>
    );
}

export default memo(SettingsStack);
