import ScreenHeader from '@components/ScreenHeader';
import ThemedSafeArea from '@components/ThemedSafeArea';
import ThemedToaster from '@components/ThemedToaster';
import useAccountRecovery from '@hooks/useAccountRecovery';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Button,
    Divider,
    Icon,
    IconProps,
    Input,
    Text,
    TopNavigationAction,
    useStyleSheet,
} from '@ui-kitten/components';
import { memo, useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import RecoverySetupScreenStyles from './RecoverySetupScreen.styles';
import { SettingsStackParamList } from './SettingsStackParamList';

const EmailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

type Props = NativeStackScreenProps<SettingsStackParamList, 'Main'>;

function RecoverySetupScreen({ navigation }: Props) {
    const styles = useStyleSheet(RecoverySetupScreenStyles);
    const { startRecoverySetup } = useAccountRecovery();
    const [emailAddress, setEmailAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const handleExplain = useCallback(() => {
        Alert.alert(
            'How We Use Your Email',
            'When you sign up for Account Recovery, instead of storing your email address directly, we store a one way cryptographic hash.\r\n\r\nThis means we can only verify if the email address you use later to recover is the same as you enter now. We cannot turn that hash back into your email address.',
        );
    }, []);
    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        if (await startRecoverySetup(emailAddress)) {
            navigation.pop();
            Toast.show({
                type: 'success',
                text1: 'Setup Account Recovery',
                text2: 'Please check your inbox!',
            });
        }
        setIsSubmitting(false);
    }, [startRecoverySetup, emailAddress, navigation]);
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );
    const isValid = useMemo(() => emailAddress.match(EmailPattern), [emailAddress]);

    return (
        <ThemedSafeArea edges={['bottom', 'left', 'right']}>
            <ScreenHeader title="Setup Account Recovery" accessoryLeft={renderMenuAction} />
            <Divider />
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <Text style={styles.para}>
                    Setting up Account Recovery is simple! Enter your email address below and we&apos;ll send you a link
                    to confirm. Just click the link and you&apos;re done!
                </Text>
                <Text style={styles.para}>
                    If your device ever changes, you&apos;ll be able to enter your email again to get a magic link that
                    logs you back in, instantly.
                </Text>
                <Text style={styles.para}>
                    SWRDL respects your privacy. We will never contact you via email unless you ask us to. In fact, we
                    can&apos;t. Your email address is completely secure and is never stored.
                </Text>
                <Button appearance="ghost" size="small" style={styles.infoButton} onPress={handleExplain}>
                    How does that work, though?
                </Button>
                <Text category="h6" style={styles.formHeader}>
                    To get started, enter your email
                </Text>
                <Input
                    spellCheck={false}
                    label="Email address"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="done"
                    onEndEditing={e => setEmailAddress(e.nativeEvent.text)}
                />
                <Button disabled={!isValid || isSubmitting} style={styles.submitButton} onPress={handleSubmit}>
                    Send Setup Email
                </Button>
            </KeyboardAwareScrollView>
            <ThemedToaster />
        </ThemedSafeArea>
    );
}

export default memo(RecoverySetupScreen);
