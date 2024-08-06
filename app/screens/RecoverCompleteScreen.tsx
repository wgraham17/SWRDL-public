import * as Sentry from '@sentry/react-native';
import { useEffect, useRef } from 'react';
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
import useAppUser from '@hooks/useAppUser';
import { AuthedStackParamList } from './AuthedStackParamList';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
type Props = NativeStackScreenProps<AuthedStackParamList, 'RecoverComplete'>;

function RecoverCompleteScreen({ navigation, route }: Props) {
    const { completeRecovery } = useAccountRecovery();
    const { handleRecoveredToken } = useAppUser();
    const hasInit = useRef(false);
    const progress = useSharedValue(0);
    const animatedProps = useAnimatedProps(() => ({ progress: progress.value + 0.255555556 }));
    const axios = useAxios(false);
    const { token } = route.params;

    useEffect(() => {
        progress.value = withRepeat(withTiming(0.11, { duration: 750, easing: Easing.linear }), -1, true);
    }, [progress]);

    useEffect(() => {
        if (!axios || !navigation || !token || !completeRecovery || !handleRecoveredToken || hasInit.current) {
            return;
        }

        hasInit.current = true;

        const onAnimationDone = (recoveredToken: string) => {
            setTimeout(async () => {
                await handleRecoveredToken(recoveredToken);
                if (navigation.canGoBack()) {
                    navigation.popToTop();
                }
            }, 750);
        };

        const doWork = async () => {
            try {
                const result = await completeRecovery(token, false);

                if (result === 'link-expired') {
                    navigation.pop();
                    Toast.show({
                        type: 'error',
                        text1: 'Recovery Failed',
                        text2: 'This link has expired.',
                    });
                    return;
                }

                if (result === 'error') {
                    navigation.pop();
                    Toast.show({
                        type: 'error',
                        text1: 'Recovery Failed',
                        text2: 'We had a problem recovering your account. Please try again.',
                    });
                    return;
                }

                cancelAnimation(progress);
                progress.value = withTiming(1, { duration: 1000, easing: Easing.linear }, () =>
                    runOnJS(onAnimationDone)(result.token),
                );
            } catch (err) {
                Sentry.captureException(err);
                navigation.pop();
            }

            hasInit.current = false;
        };

        doWork();
    }, [navigation, progress, axios, token, completeRecovery, handleRecoveredToken]);

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, alignSelf: 'center', width: '70%' }}>
                <AnimatedLottieView source={creatingAnimation} animatedProps={animatedProps} renderMode="HARDWARE" />
            </View>
        </ThemedSafeArea>
    );
}

export default RecoverCompleteScreen;
