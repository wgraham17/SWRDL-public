import ScreenHeader from '@components/ScreenHeader';
import ThemedSafeArea from '@components/ThemedSafeArea';
import ThemedToaster from '@components/ThemedToaster';
import useAccountRecovery from '@hooks/useAccountRecovery';
import useAppUser from '@hooks/useAppUser';
import useNotifications from '@hooks/useNotifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Divider,
    Icon,
    IconProps,
    Layout,
    ListItem,
    Spinner,
    Text,
    Toggle,
    TopNavigationAction,
    useStyleSheet,
} from '@ui-kitten/components';
import { memo, useCallback } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import SettingsMainScreenStyles from './SettingsMainScreen.styles';
import { SettingsStackParamList } from './SettingsStackParamList';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

function SetupRecoveryIcon(props: IconProps) {
    return <Icon {...props} name="shield" />;
}

function RecoverIcon(props: IconProps) {
    return <Icon {...props} name="flip-2" />;
}

function HowToIcon(props: IconProps) {
    return <Icon {...props} name="question-mark-circle" />;
}

function PrivacyIcon(props: IconProps) {
    return <Icon {...props} name="eye-off" />;
}

function LicensesIcon(props: IconProps) {
    return <Icon {...props} name="file-text" />;
}

function GoIcon(props: IconProps) {
    return <Icon {...props} name="arrow-ios-forward" />;
}

type Props = NativeStackScreenProps<SettingsStackParamList, 'Main'>;

function SettingsMainScreen({ navigation }: Props) {
    const styles = useStyleSheet(SettingsMainScreenStyles);
    const { appUser, signOut } = useAppUser();
    const { recoveryEnabled } = useAccountRecovery();
    const {
        notificationsEnabled,
        enableNotifications,
        disableNotifications,
        isUpdating: isUpdatingNotifications,
    } = useNotifications();
    const handleNavigate = useCallback((page: keyof SettingsStackParamList) => navigation.push(page), [navigation]);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const handleToggleNotifications = useCallback(
        async (value: boolean) => {
            if (value) {
                await enableNotifications();
            } else {
                await disableNotifications();
            }
        },
        [enableNotifications, disableNotifications],
    );
    const handleRecoverAccount = useCallback(() => {
        Alert.alert(
            'Switch Accounts',
            `Are you sure you want to switch to another SWRDL account? You will lose access to "${appUser?.name}" permanently.\r\n\r\nTypically, you only need to do this if you set up Account Recovery and accidentally created a new one instead of recovering your old one.`,
            [
                { text: 'Nevermind', style: 'cancel' },
                { text: 'I Understand', style: 'destructive', onPress: () => signOut() },
            ],
        );
    }, [appUser, signOut]);
    const renderMenuAction = () => (
        <TopNavigationAction
            accessibilityLabel="Go Back"
            icon={BackIcon}
            onPress={handleBack}
            testID="SettingsMainScreen.Back"
        />
    );

    return (
        <ThemedSafeArea edges={['bottom', 'left', 'right']}>
            <ScreenHeader title="Settings" accessoryLeft={renderMenuAction} />
            <Divider />
            <View style={styles.root}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Layout style={styles.section}>
                        <Text category="label" style={styles.sectionTitle}>
                            Notifications
                        </Text>
                        {!isUpdatingNotifications && (
                            <Toggle
                                disabled={isUpdatingNotifications}
                                status="primary"
                                checked={notificationsEnabled}
                                onChange={handleToggleNotifications}
                                style={styles.notificationsToggle}
                                testID="SettingsMainScreen.Notifications.Toggle"
                            >
                                <Text category="s2">Notify me when a new word is ready to play</Text>
                            </Toggle>
                        )}
                        {isUpdatingNotifications && (
                            <View style={styles.notificationsPlaceholder}>
                                <View style={styles.notificationsSpinner}>
                                    <Spinner size="large" />
                                </View>
                                <Text category="s2">Notify me when a new word is ready to play</Text>
                            </View>
                        )}
                    </Layout>
                    <Divider style={styles.sectionDivider} />
                    {!recoveryEnabled && (
                        <Layout style={styles.section}>
                            <Text category="label" style={styles.sectionTitle}>
                                Account Recovery
                            </Text>
                            <Text category="p2" appearance="hint" style={styles.recoveryHint}>
                                By linking your account to an email address, Account Recovery can email you a link to
                                get back into SWRDL if you reset or upgrade your device, keeping your games and stats.
                            </Text>
                            <Divider />
                            <ListItem
                                title="Setup Account Recovery"
                                description="Protect access to your SWRDL"
                                onPress={() => handleNavigate('RecoverySetup')}
                                accessoryLeft={SetupRecoveryIcon}
                                accessoryRight={GoIcon}
                                activeOpacity={0.5}
                                testID="SettingsMainScreen.AccountRecovery.SetupRecovery"
                            />
                            <Divider />
                            <ListItem
                                title="Recover Another Account"
                                description="Switch to a different SWRDL account"
                                onPress={handleRecoverAccount}
                                accessoryLeft={RecoverIcon}
                                accessoryRight={GoIcon}
                                activeOpacity={0.5}
                                testID="SettingsMainScreen.AccountRecovery.SwitchAccount"
                            />
                        </Layout>
                    )}
                    {recoveryEnabled && (
                        <Layout style={styles.section}>
                            <Text category="label" style={styles.sectionTitle}>
                                Account Recovery
                            </Text>
                            <Text category="p2" appearance="hint" style={styles.recoveryHint}>
                                By linking your account to an email address, Account Recovery can email you a link to
                                get back into SWRDL if you reset or upgrade your device, keeping your games and stats.
                            </Text>
                            <View style={styles.recoverySuccess}>
                                <Icon name="shield" style={styles.recoveryIcon} />
                                <Text category="s1" status="success">
                                    You&apos;re all set for Account Recovery!
                                </Text>
                            </View>
                        </Layout>
                    )}
                    <Divider style={styles.sectionDivider} />
                    <Layout style={styles.section}>
                        <Text category="label" style={styles.sectionTitle}>
                            Other
                        </Text>
                        <ListItem
                            title="How to Play"
                            description="A quick intro to playing SWRDL"
                            onPress={() => handleNavigate('HowToPlay')}
                            accessoryLeft={HowToIcon}
                            accessoryRight={GoIcon}
                            activeOpacity={0.5}
                            testID="SettingsMainScreen.Other.HowToPlay"
                        />
                        <Divider />
                        <ListItem
                            title="Privacy Policy"
                            description="The data we collect and what we do with it"
                            onPress={() => handleNavigate('Privacy')}
                            accessoryLeft={PrivacyIcon}
                            accessoryRight={GoIcon}
                            activeOpacity={0.5}
                            testID="SettingsMainScreen.Other.Privacy"
                        />
                        <Divider />
                        <ListItem
                            title="Third Party Software Notices"
                            onPress={() => handleNavigate('ThirdPartySoftware')}
                            accessoryLeft={LicensesIcon}
                            accessoryRight={GoIcon}
                            activeOpacity={0.5}
                            testID="SettingsMainScreen.Other.ThirdPartySoftware"
                        />
                    </Layout>
                </ScrollView>
            </View>
            <ThemedToaster />
        </ThemedSafeArea>
    );
}

export default memo(SettingsMainScreen);
