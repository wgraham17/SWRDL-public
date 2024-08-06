import * as Sentry from '@sentry/react-native';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet, useColorScheme, View } from 'react-native';
import useAppUser from '@hooks/useAppUser';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SplashImage from '@assets/splash.png';

interface Props {
    children: ReactNode;
}

function AnimatedSplashScreen({ children }: Props) {
    const opacity = useSharedValue(1);
    const [isAppReady, setAppReady] = useState(false);
    const { restoreUser } = useAppUser();
    const [animationComplete, setAnimationComplete] = useState(false);
    const animatedViewStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
    const animatedImageStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: opacity.value,
            },
        ],
    }));
    const colorScheme = useColorScheme();
    const backgroundColor = useMemo(() => (colorScheme === 'dark' ? '#222B45' : '#ffffff'), [colorScheme]);

    useEffect(() => {
        if (isAppReady) {
            const done = () => setAnimationComplete(true);
            opacity.value = withTiming(0, { duration: 500 }, () => runOnJS(done)());
        }
    }, [isAppReady, opacity]);

    const onImageLoaded = useCallback(async () => {
        try {
            await SplashScreen.hideAsync();
            await restoreUser();
        } catch (e) {
            Sentry.captureException(e);
        } finally {
            setAppReady(true);
        }
    }, [restoreUser]);

    return (
        <View style={{ flex: 1 }}>
            {isAppReady && children}
            {!animationComplete && (
                <Animated.View
                    pointerEvents="none"
                    style={[StyleSheet.absoluteFill, animatedViewStyle, { backgroundColor }]}
                >
                    <Animated.Image
                        style={[
                            {
                                width: '100%',
                                height: '100%',
                                resizeMode: 'contain',
                            },
                            animatedImageStyle,
                        ]}
                        source={SplashImage}
                        onLoadEnd={onImageLoaded}
                        fadeDuration={0}
                    />
                </Animated.View>
            )}
        </View>
    );
}

export default AnimatedSplashScreen;
