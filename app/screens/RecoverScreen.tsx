import Logo from '@components/logo';
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
    TextProps,
    TopNavigation,
    TopNavigationAction,
    useStyleSheet,
} from '@ui-kitten/components';
import { memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Edge } from 'react-native-safe-area-context';
import RecoverySetupScreenStyles from './RecoverySetupScreen.styles';

const EmailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = NativeStackScreenProps<any>;

function RecoverScreen({ navigation, route }: Props) {
    const styles = useStyleSheet(RecoverySetupScreenStyles);
    const { startRecovery } = useAccountRecovery();
    const [emailAddress, setEmailAddress] = useState('');
    const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle');
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const handleSubmit = useCallback(async () => {
        setSubmitState('submitting');
        if (await startRecovery(emailAddress)) {
            setSubmitState('done');
        } else {
            setSubmitState('idle');
        }
    }, [startRecovery, emailAddress]);
    const renderTitle = (props: TextProps | undefined) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Logo width={28} height={32} style={{ marginHorizontal: 8 }} />
            <Text {...props}>Recover Account</Text>
        </View>
    );
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );
    const isValid = useMemo(() => emailAddress.match(EmailPattern), [emailAddress]);
    const safeAreaEdges = route.params?.fromSettings ? (['bottom', 'right', 'left'] as Edge[]) : undefined;

    return (
        <ThemedSafeArea edges={safeAreaEdges}>
            <TopNavigation title={renderTitle} accessoryLeft={renderMenuAction} />
            <Divider />
            {submitState === 'done' && (
                <View style={styles.waitContainer}>
                    <Text>Check your inbox to continue.</Text>
                </View>
            )}
            {submitState !== 'done' && (
                <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                    <Text category="h6" style={styles.formHeader}>
                        To recover your account, enter your email
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
                    <Button
                        disabled={!isValid || submitState === 'submitting'}
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        Send Recovery Email
                    </Button>
                </KeyboardAwareScrollView>
            )}
            <ThemedToaster />
        </ThemedSafeArea>
    );
}

export default memo(RecoverScreen);
