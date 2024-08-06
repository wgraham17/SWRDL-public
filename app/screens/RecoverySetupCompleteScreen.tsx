import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import useAxios from '@hooks/useAxios';
import creatingAnimation from '@assets/animations/creating.json';
import useAccountRecovery from '@hooks/useAccountRecovery';
import ThemedSafeArea from '@components/ThemedSafeArea';
import { AuthedStackParamList } from './AuthedStackParamList';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
type Props = NativeStackScreenProps<AuthedStackParamList, 'RecoverySetupComplete'>;

function RecoverySetupCompleteScreen({ navigation, route }: Props) {
    const { completeRecoverySetup } = useAccountRecovery();
    const progress = useSharedValue(0);
    const animatedProps = useAnimatedProps(() => ({ progress: progress.value + 0.255555556 }));
    const axios = useAxios(false);
    const { token } = route.params;

    useEffect(() => {
        progress.value = withRepeat(withTiming(0.11, { duration: 750, easing: Easing.linear }), -1, true);
    }, [progress]);

    useEffect(() => {
        if (axios) {
            const onAnimationDone = () => {
                setTimeout(() => navigation.pop(), 750);
            };

            const doWork = async () => {
                try {
                    const result = await completeRecoverySetup(token);

                    if (result === 'link-expired') {
                        navigation.pop();
                        Toast.show({
                            type: 'error',
                            text1: 'Setup Failed',
                            text2: 'Your confirmation link expired.',
                        });
                        return;
                    }

                    if (result === 'already-set-up') {
                        navigation.pop();
                        Toast.show({
                            type: 'error',
                            text1: 'Setup Failed',
                            text2: 'Account Recovery is already set up for this account.',
                        });
                        return;
                    }

                    if (result === 'error') {
                        navigation.pop();
                        Toast.show({
                            type: 'error',
                            text1: 'Setup Failed',
                            text2: 'We had a problem setting up recovery for your account. Please try again.',
                        });
                        return;
                    }

                    cancelAnimation(progress);
                    progress.value = withTiming(1, { duration: 1000, easing: Easing.linear }, () =>
                        runOnJS(onAnimationDone)(),
                    );
                } catch (err) {
                    Sentry.captureException(err);
                    navigation.pop();
                }
            };

            doWork();
        }
    }, [navigation, progress, axios, token, completeRecoverySetup]);

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, alignSelf: 'center', width: '70%' }}>
                <AnimatedLottieView source={creatingAnimation} animatedProps={animatedProps} renderMode="HARDWARE" />
            </View>
        </ThemedSafeArea>
    );
}

export default RecoverySetupCompleteScreen;
