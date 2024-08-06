import LobbyGuessInput from '@components/LobbyGuessInput';
import ThemedSafeArea from '@components/ThemedSafeArea';
import {
    Divider,
    Icon,
    IconProps,
    Text,
    TextProps,
    TopNavigation,
    TopNavigationAction,
    useStyleSheet,
} from '@ui-kitten/components';
import { LayoutRectangle, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Logo from '@components/logo';
import roundWonAnimation from '@assets/animations/round-won.json';
import LobbyGuessRow from '@components/LobbyGuessRow';
import LobbyGuessesStyles from '@components/LobbyGuesses.styles';
import { AuthedStackParamList } from './AuthedStackParamList';
import DemoScreenStyles from './DemoScreen.styles';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

type Props = NativeStackScreenProps<AuthedStackParamList>;

function DemoScreen({ navigation }: Props) {
    const styles = useStyleSheet(DemoScreenStyles);
    const guessStyles = useStyleSheet(LobbyGuessesStyles);
    const [rootSize, setRootSize] = useState<LayoutRectangle>();

    const progress = useSharedValue(0);
    const animatedProps = useAnimatedProps(() => ({ progress: progress.value }));
    const didWin = true;

    const lottieStyle = useMemo(
        () =>
            StyleSheet.create({
                lottie: {
                    width: rootSize?.width || 0,
                    height: rootSize?.height || 0,
                    position: 'absolute',
                    zIndex: 10,
                },
            }),
        [rootSize],
    );
    const handleBack = useCallback(() => navigation.pop(), [navigation]);

    const renderMenuAction = useMemo(() => <TopNavigationAction icon={BackIcon} onPress={handleBack} />, [handleBack]);
    const renderTitle = useCallback(
        (props: TextProps | undefined) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Logo width={28} height={32} style={{ marginHorizontal: 8 }} />
                <Text {...props}>Classic Continuous - Round 1</Text>
            </View>
        ),
        [],
    );

    useEffect(() => {
        if (didWin) {
            progress.value = 0;
            setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 1200);
            progress.value = withDelay(1000, withTiming(1, { duration: 5000, easing: Easing.linear }));
        }
    }, [progress, didWin]);

    return (
        <ThemedSafeArea>
            <TopNavigation title={renderTitle} accessoryLeft={renderMenuAction} />
            <Divider />

            <View style={styles.root} onLayout={e => setRootSize(e.nativeEvent.layout)}>
                <View style={styles.guessContainer}>
                    <View style={guessStyles.container}>
                        <LobbyGuessRow word="GROUP" mask="02000" />
                        <LobbyGuessRow word="WORD " mask="20330" />
                        <LobbyGuessRow word=" GAME" mask="00000" />
                        <LobbyGuessRow word="SWRDL" mask="33333" />
                    </View>
                </View>
                <View>
                    <LobbyGuessInput participant={null} />
                </View>
                {didWin && (
                    <AnimatedLottieView
                        style={lottieStyle.lottie}
                        source={roundWonAnimation}
                        resizeMode="cover"
                        renderMode="HARDWARE"
                        animatedProps={animatedProps}
                    />
                )}
            </View>
        </ThemedSafeArea>
    );
}

export default memo(DemoScreen);
