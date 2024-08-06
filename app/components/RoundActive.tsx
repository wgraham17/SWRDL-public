import { GuessInputProvider } from '@hooks/useGuessInput';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
    BounceIn,
    Easing,
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { memo, useEffect, useMemo, useState } from 'react';
import { Modal, useStyleSheet } from '@ui-kitten/components';
import { useLobby } from '@hooks/useLobby';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import roundWonAnimation from '@assets/animations/round-won.json';
import { ScrollView } from 'react-native-gesture-handler';
import RoundStats from './RoundStats';
import LobbyGuessInput from './LobbyGuessInput';
import LobbyGuesses from './LobbyGuesses';
import RoundActiveStyles from './RoundActive.styles';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface Props {
    roundSequence: number;
    participantId: string;
    isLive: boolean;
}

function RoundActive({ roundSequence, participantId, isLive }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const styles = useStyleSheet(RoundActiveStyles);
    const { lobby } = useLobby();
    const [showStats, setShowStats] = useState(false);
    const round = useMemo(() => lobby?.rounds.find(r => r.sequence === roundSequence), [lobby, roundSequence]);
    const participant = useMemo(() => round?.participants.find(p => p.user === participantId), [round, participantId]);
    const progress = useSharedValue(0);
    const animatedProps = useAnimatedProps(() => ({ progress: progress.value }));
    const didWin = participant?.isDone && participant.guesses.some(g => g.mask === '33333');
    const didLose = participant?.isDone && !participant.guesses.some(g => g.mask === '33333');
    const windowSize = useWindowDimensions();

    const lottieStyle = useMemo(
        () =>
            StyleSheet.create({
                lottie: {
                    width: windowSize.width,
                    height: windowSize.height,
                    position: 'absolute',
                    zIndex: 10,
                },
            }),
        [windowSize],
    );

    useEffect(() => {
        if (didWin && isLive) {
            progress.value = 0;
            setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 1100);
            progress.value = withDelay(1000, withTiming(1, { duration: 3500, easing: Easing.linear }));
        }
    }, [progress, didWin, isLive]);

    useEffect(() => {
        if (didWin) {
            const winDelay = isLive ? 3000 : 1200;
            const timer = setTimeout(() => setShowStats(true), winDelay);
            return () => clearTimeout(timer);
        }

        if (didLose) {
            const timer = setTimeout(() => setShowStats(true), 1200);
            return () => clearTimeout(timer);
        }

        return undefined;
    }, [didWin, didLose, isLive]);

    const enterAnimation = useMemo(() => (Platform.OS === 'android' ? undefined : BounceIn), []);

    if (!lobby || !round || !participant) {
        return null;
    }

    return (
        <GuessInputProvider roundSequence={roundSequence} participantId={participantId}>
            <View style={styles.root}>
                <ScrollView style={styles.guessContainer}>
                    <LobbyGuesses round={round} participantId={participantId} />
                </ScrollView>
                <View>
                    <LobbyGuessInput participant={participant} />
                </View>
                {didWin && (
                    <View pointerEvents="none" style={lottieStyle.lottie}>
                        <AnimatedLottieView
                            style={lottieStyle.lottie}
                            source={roundWonAnimation}
                            resizeMode="cover"
                            renderMode="HARDWARE"
                            animatedProps={animatedProps}
                        />
                    </View>
                )}
                <Modal visible={showStats} backdropStyle={styles.backdrop} onBackdropPress={() => setShowStats(false)}>
                    {showStats && (
                        <Animated.View entering={enterAnimation}>
                            <RoundStats
                                lobby={lobby}
                                roundSequence={roundSequence}
                                participantId={participantId}
                                navigation={navigation}
                            />
                        </Animated.View>
                    )}
                </Modal>
            </View>
        </GuessInputProvider>
    );
}

export default memo(RoundActive);
