import ThemedSafeArea from '@components/ThemedSafeArea';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Divider,
    Icon,
    IconProps,
    Layout,
    Text,
    TopNavigationAction,
    useStyleSheet,
    useTheme,
} from '@ui-kitten/components';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import * as Sentry from '@sentry/react-native';
import creatingAnimation from '@assets/animations/creating.json';
import useLobbyList from '@hooks/useLobbyList';
import ThemedToaster from '@components/ThemedToaster';
import ScreenHeader from '@components/ScreenHeader';
import { AuthedStackParamList } from './AuthedStackParamList';
import JoinGameScreenStyles from './JoinGameScreen.styles';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

interface DigitDisplayProps {
    joinKey: string;
    index: number;
}

function DigitDisplay({ joinKey, index }: DigitDisplayProps) {
    const styles = useStyleSheet(JoinGameScreenStyles);

    return (
        <View style={styles.pinDigitContainer}>
            <Text category="h1" adjustsFontSizeToFit>
                {joinKey.charAt(index) || ' '}
            </Text>
        </View>
    );
}

interface DigitInputProps {
    digit: string;
    handleAppend: (v: string) => void;
    disabled: boolean;
}

function DigitInput({ digit, handleAppend, disabled }: DigitInputProps) {
    const styles = useStyleSheet(JoinGameScreenStyles);
    const primaryColor = useTheme()['color-primary-500'];

    return (
        <BorderlessButton
            activeOpacity={0.5}
            rippleColor={primaryColor}
            exclusive={false}
            enabled={!disabled}
            style={[styles.button, disabled ? styles.buttonDisabled : null]}
            onPress={() => handleAppend(digit)}
        >
            <Text category="h1" appearance={disabled ? 'hint' : 'default'}>
                {digit}
            </Text>
        </BorderlessButton>
    );
}

type Props = NativeStackScreenProps<AuthedStackParamList, 'JoinGame'>;

function JoinGameScreen({ navigation, route }: Props) {
    const [joinKey, setJoinKey] = useState<string>('');
    const [isJoining, setIsJoining] = useState(false);
    const hasAttemptedRouteJoin = useRef(false);
    const styles = useStyleSheet(JoinGameScreenStyles);
    const primaryColor = useTheme()['color-primary-500'];
    const progress = useSharedValue(0);
    const animatedProps = useAnimatedProps(() => ({ progress: progress.value + 0.255555556 }));
    const { joinLobby, canJoin } = useLobbyList();
    const routeJoinKey = route.params?.joinKey;

    const handleJoin = useCallback(
        async (key: string) => {
            try {
                if (!key || key.length !== 7) throw new Error('JoinKey not set');

                const joinComplete = async () => {
                    navigation.pop();
                    navigation.push('Lobby', { joinKey: key });
                };

                progress.value = withRepeat(withTiming(0.11, { duration: 750, easing: Easing.linear }), -1, true);
                setIsJoining(true);

                await new Promise(resolve => {
                    setTimeout(resolve, 1000);
                });

                const result = await joinLobby(key);

                if (!result) throw new Error('Failed to join game');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                cancelAnimation(progress);
                progress.value = withTiming(1, { duration: 1000, easing: Easing.linear }, () =>
                    runOnJS(joinComplete)(),
                );
            } catch (err) {
                Sentry.captureException(err);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Toast.show({
                    type: 'error',
                    text1: "Couldn't find that lobby",
                    text2: 'Please check the game code and try again.',
                    position: 'bottom',
                });
                setIsJoining(false);
                cancelAnimation(progress);
                progress.value = 0;
            }
        },
        [navigation, progress, joinLobby],
    );

    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );
    const handleAppend = useCallback((char: string) => {
        setJoinKey(v => (v + char).substring(0, 7));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);
    const handleBackspace = useCallback(() => {
        setJoinKey(v => v.slice(0, -1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    useEffect(() => {
        if (routeJoinKey && canJoin && !hasAttemptedRouteJoin.current) {
            hasAttemptedRouteJoin.current = true;
            setJoinKey(routeJoinKey);
            handleJoin(routeJoinKey);
        }
    }, [routeJoinKey, handleJoin, canJoin]);

    useEffect(() => {
        const eventSub = Linking.addEventListener('url', evt => {
            const joinMatch1 = /https:\/\/(?:www\.)?swrdl\.app\/j\/(\d{7})/g.exec(evt.url);
            const joinMatch2 = /swrdl:\/\/join\/(\d{7})/g.exec(evt.url);
            const joinMatch = joinMatch1 || joinMatch2;

            if (joinMatch) {
                setJoinKey(joinMatch[1]);
                handleJoin(joinMatch[1]);
            }
        });

        return () => eventSub.remove();
    }, [handleJoin]);

    const backspaceEnabled = joinKey.length > 0;
    const enteredJoinKey = joinKey.length === 7;
    const enterEnabled = enteredJoinKey && !isJoining;

    return (
        <ThemedSafeArea>
            <ScreenHeader title="Join Game" accessoryLeft={renderMenuAction} />
            <Divider />
            {!isJoining && (
                <Layout style={styles.container}>
                    <Text style={styles.explainer}>To join a game, enter the code from the lobby host.</Text>
                    <View style={styles.pinContainer}>
                        <DigitDisplay joinKey={joinKey} index={0} />
                        <DigitDisplay joinKey={joinKey} index={1} />
                        <View style={styles.bufferRight} />
                        <DigitDisplay joinKey={joinKey} index={2} />
                        <DigitDisplay joinKey={joinKey} index={3} />
                        <DigitDisplay joinKey={joinKey} index={4} />
                        <View style={styles.bufferRight} />
                        <DigitDisplay joinKey={joinKey} index={5} />
                        <DigitDisplay joinKey={joinKey} index={6} />
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.entryContainer}>
                            <View style={styles.entryRow}>
                                <DigitInput digit="1" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <DigitInput digit="2" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <DigitInput digit="3" handleAppend={handleAppend} disabled={enteredJoinKey} />
                            </View>
                            <View style={styles.entryRow}>
                                <DigitInput digit="4" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <DigitInput digit="5" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <DigitInput digit="6" handleAppend={handleAppend} disabled={enteredJoinKey} />
                            </View>
                            <View style={styles.entryRow}>
                                <DigitInput digit="7" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <DigitInput digit="8" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <DigitInput digit="9" handleAppend={handleAppend} disabled={enteredJoinKey} />
                            </View>
                            <View style={styles.entryRow}>
                                <BorderlessButton
                                    activeOpacity={0.5}
                                    rippleColor={primaryColor}
                                    exclusive={false}
                                    enabled={enterEnabled}
                                    style={[styles.button, !enterEnabled ? styles.buttonDisabled : null]}
                                    onPress={() => handleJoin(joinKey)}
                                >
                                    <View accessible accessibilityLabel="Join Game">
                                        <Text category="h6" appearance={enterEnabled ? 'default' : 'hint'}>
                                            JOIN
                                        </Text>
                                    </View>
                                </BorderlessButton>
                                <DigitInput digit="0" handleAppend={handleAppend} disabled={enteredJoinKey} />
                                <BorderlessButton
                                    activeOpacity={0.5}
                                    rippleColor={primaryColor}
                                    exclusive={false}
                                    enabled={backspaceEnabled}
                                    style={[styles.button, !backspaceEnabled ? styles.buttonDisabled : null]}
                                    onPress={handleBackspace}
                                >
                                    <View accessible accessibilityLabel="Backspace">
                                        <Icon
                                            name="backspace"
                                            style={[styles.icon, backspaceEnabled ? null : styles.iconDisabled]}
                                        />
                                    </View>
                                </BorderlessButton>
                            </View>
                        </View>
                    </View>
                </Layout>
            )}
            {isJoining && (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <AnimatedLottieView
                        source={creatingAnimation}
                        animatedProps={animatedProps}
                        renderMode="HARDWARE"
                        style={{ width: 200, height: 200 }}
                    />
                </View>
            )}
            <ThemedToaster />
        </ThemedSafeArea>
    );
}

export default JoinGameScreen;
