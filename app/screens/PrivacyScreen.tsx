import ScreenHeader from '@components/ScreenHeader';
import ThemedSafeArea from '@components/ThemedSafeArea';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Divider, Icon, IconProps, TopNavigationAction, useStyleSheet } from '@ui-kitten/components';
import { memo, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import PrivacyScreenStyles from './PrivacyScreen.styles';
import { SettingsStackParamList } from './SettingsStackParamList';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

type Props = NativeStackScreenProps<SettingsStackParamList, 'Privacy'>;

function PrivacyScreen({ navigation }: Props) {
    const styles = useStyleSheet(PrivacyScreenStyles);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );

    return (
        <ThemedSafeArea edges={['bottom', 'left', 'right']}>
            <ScreenHeader title="Privacy" accessoryLeft={renderMenuAction} />
            <Divider />
            <WebView
                style={styles.webView}
                source={{ uri: `https://swrdl.app/privacy/` }}
                onShouldStartLoadWithRequest={req => req.url.startsWith('https://swrdl.app/')}
            />
        </ThemedSafeArea>
    );
}

export default memo(PrivacyScreen);
