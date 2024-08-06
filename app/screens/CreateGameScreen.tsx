import CreateGameModeCard from '@components/CreateGameModeCard';
import ThemedSafeArea from '@components/ThemedSafeArea';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Button,
    Divider,
    Icon,
    IconProps,
    Layout,
    Text,
    TopNavigationAction,
    useStyleSheet,
} from '@ui-kitten/components';
import LottieView from 'lottie-react-native';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    Easing,
    FadeIn,
    Layout as LayoutTransition,
    LightSpeedOutLeft,
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
import { CustomLobbyGameRules, GameMode } from '@root/models';
import ThemedToaster from '@components/ThemedToaster';
import ScreenHeader from '@components/ScreenHeader';
import CreateCustomGame from '@components/CreateCustomGame';
import { GameModeDisplayNames, GetGameModeName } from '@root/util';
import { AuthedStackParamList } from './AuthedStackParamList';
import CreateGameScreenStyles from './CreateGameScreen.styles';

const AnimatedButton = Animated.createAnimatedComponent(Button);
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

type Props = NativeStackScreenProps<AuthedStackParamList, 'CreateGame'>;

function CreateGameScreen({ navigation }: Props) {
    const [gameMode, setGameMode] = useState<GameMode>();
    const [gameRules, setGameRules] = useState<CustomLobbyGameRules>();
    const [isCreating, setIsCreating] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const styles = useStyleSheet(CreateGameScreenStyles);
    const progress = useSharedValue(0);
    const animatedProps = useAnimatedProps(() => ({ progress: progress.value + 0.255555556 }));
    const { createLobby } = useLobbyList();

    const handleSetGameMode = useCallback((newMode: GameMode) => {
        setGameMode(newMode);

        switch (newMode) {
            case 'classic':
                setGameRules({
                    minPlayers: 1,
                    maxPlayers: 8,
                    wordSource: 'dictionary',
                    interval: 'daily',
                    guessLimit: 6,
                    maskResult: 'position',
                    strict: false,
                });
                break;
            case 'classic-continuous':
                setGameRules({
                    minPlayers: 1,
                    maxPlayers: 8,
                    wordSource: 'dictionary',
                    interval: 'continuous',
                    guessLimit: 6,
                    maskResult: 'position',
                    strict: false,
                });
                break;
            case 'versus':
                setGameRules({
                    minPlayers: 2,
                    maxPlayers: 2,
                    wordSource: 'pvp',
                    interval: 'continuous',
                    guessLimit: 6,
                    maskResult: 'position',
                    strict: false,
                });
                break;
            case 'custom':
            default:
                setGameRules(undefined);
                break;
        }
    }, []);

    const handleCreate = useCallback(
        async (gameName: string, newLobbyRules: CustomLobbyGameRules) => {
            try {
                if (!gameMode) throw new Error('GameMode not set');

                const createComplete = async (joinKey: string) => {
                    navigation.pop();
                    navigation.push('Lobby', { joinKey });
                };

                progress.value = withRepeat(withTiming(0.11, { duration: 750, easing: Easing.linear }), -1, true);
                setIsCreating(true);

                const joinKey = await createLobby(newLobbyRules, gameName);

                if (!joinKey) throw new Error('Failed to create game');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                cancelAnimation(progress);
                progress.value = withTiming(1, { duration: 1000, easing: Easing.linear }, () =>
                    runOnJS(createComplete)(joinKey),
                );
            } catch (err) {
                Sentry.captureException(err);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Toast.show({
                    type: 'error',
                    text1: 'We ran into a problem',
                    text2: 'Please try creating your lobby again later.',
                    position: 'bottom',
                });
                setIsCreating(false);
                cancelAnimation(progress);
                progress.value = 0;
            }
        },
        [gameMode, navigation, progress, createLobby],
    );

    const handleCreatePreset = useCallback(() => {
        if (!gameRules || !gameMode) return;

        handleCreate(GameModeDisplayNames[gameMode], gameRules);
    }, [gameRules, gameMode, handleCreate]);

    const handleCreateCustom = useCallback(
        (customRules: CustomLobbyGameRules) => {
            const gameName = GetGameModeName(customRules);
            handleCreate(gameName, customRules);
        },
        [handleCreate],
    );

    const handleBack = () => {
        if (!gameMode) {
            navigation.pop();
        } else {
            setGameMode(undefined);
        }
    };
    const handleScrollToBottom = useCallback(() => scrollRef.current?.scrollToEnd(), []);
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );

    const pickedGameMode = !!gameMode;
    const showClassicCard = !pickedGameMode || gameMode === 'classic';
    const showContinuousCard = !pickedGameMode || gameMode === 'classic-continuous';
    const showVersusCard = !pickedGameMode || gameMode === 'versus';
    const showCustomCard = !pickedGameMode || gameMode === 'custom';

    return (
        <ThemedSafeArea edges={['bottom', 'left', 'right']}>
            <ScreenHeader title="Create New Game" accessoryLeft={renderMenuAction} />
            <Divider />
            <Layout style={styles.container}>
                {!isCreating && (
                    <ScrollView style={styles.scrollView} alwaysBounceVertical={false} ref={scrollRef}>
                        {!gameMode && (
                            <Animated.View
                                entering={FadeIn.delay(0)}
                                exiting={LightSpeedOutLeft}
                                layout={LayoutTransition}
                            >
                                <Text category="label" style={styles.sectionHeader}>
                                    Presets
                                </Text>
                            </Animated.View>
                        )}
                        {showClassicCard && (
                            <CreateGameModeCard
                                index={1}
                                gameMode="classic"
                                wordSource="Dictionary"
                                minPlayers={1}
                                maxPlayers={8}
                                guessLimit={6}
                                strict={false}
                                maskResult="position"
                                schedule="Midnight"
                                selected={gameMode === 'classic'}
                                onPress={() => handleSetGameMode('classic')}
                            />
                        )}
                        {showContinuousCard && (
                            <CreateGameModeCard
                                index={2}
                                gameMode="classic-continuous"
                                wordSource="Dictionary"
                                minPlayers={1}
                                maxPlayers={8}
                                guessLimit={6}
                                strict={false}
                                maskResult="position"
                                schedule="Continuous"
                                selected={gameMode === 'classic-continuous'}
                                onPress={() => handleSetGameMode('classic-continuous')}
                            />
                        )}
                        {showVersusCard && (
                            <CreateGameModeCard
                                index={3}
                                gameMode="versus"
                                wordSource="PvP"
                                minPlayers={2}
                                maxPlayers={2}
                                guessLimit={6}
                                strict={false}
                                maskResult="position"
                                schedule="Continuous"
                                selected={gameMode === 'versus'}
                                onPress={() => handleSetGameMode('versus')}
                            />
                        )}
                        {showCustomCard && (
                            <CreateCustomGame
                                index={4}
                                selected={gameMode === 'custom'}
                                onPress={() => handleSetGameMode('custom')}
                                onCreate={handleCreateCustom}
                                onScrollRequested={handleScrollToBottom}
                            />
                        )}
                        {pickedGameMode && !isCreating && !showCustomCard && (
                            <AnimatedButton
                                style={styles.createButton}
                                entering={FadeIn.delay(300)}
                                layout={LayoutTransition}
                                onPress={handleCreatePreset}
                            >
                                Create Game
                            </AnimatedButton>
                        )}
                    </ScrollView>
                )}
                {isCreating && (
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
            </Layout>
            <ThemedToaster />
        </ThemedSafeArea>
    );
}

export default CreateGameScreen;
