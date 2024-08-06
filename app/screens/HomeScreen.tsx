import LobbyCard from '@components/LobbyCard';
import ScreenHeader from '@components/ScreenHeader';
import SkeletonLoader from '@components/SkeletonLoader';
import ThemedRefreshControl from '@components/ThemedRefreshControl';
import ThemedSafeArea from '@components/ThemedSafeArea';
import useAppUser from '@hooks/useAppUser';
import useLobbyList from '@hooks/useLobbyList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Lobby } from '@root/models';
import { GameModeDisplayNames } from '@root/util';
import {
    Button,
    Divider,
    Icon,
    IconProps,
    Layout,
    ListItem,
    Text,
    TopNavigationAction,
    useStyleSheet,
} from '@ui-kitten/components';
import { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { AuthedStackParamList } from './AuthedStackParamList';
import HomeScreenStyles from './HomeScreen.styles';

function MenuIcon(props: IconProps) {
    return <Icon {...props} name="settings" />;
}

function NewGameIcon(props: IconProps) {
    return <Icon {...props} name="plus-square" />;
}

function JoinGameIcon(props: IconProps) {
    return <Icon {...props} name="log-in" />;
}

function GoIcon(props: IconProps) {
    return <Icon {...props} name="arrow-ios-forward" />;
}

type Props = NativeStackScreenProps<AuthedStackParamList, 'Home'>;

function HomeScreen({ navigation }: Props) {
    const styles = useStyleSheet(HomeScreenStyles);
    const { lobbies, isRefreshingLobbies, waitingForLobbyUpdate, refreshLobbies } = useLobbyList();
    const { needsWelcomePrompt, offerWelcomePrompt } = useAppUser();
    const handleManualRefresh = useCallback(() => refreshLobbies(true), [refreshLobbies]);
    const handleCreate = useCallback(() => navigation.push('CreateGame'), [navigation]);
    const handleJoin = useCallback(() => navigation.push('JoinGame'), [navigation]);
    const handleSettings = useCallback(() => navigation.push('Settings'), [navigation]);
    const lobbiesSorter = useCallback((a: Lobby, b: Lobby) => {
        const activeStatuses = ['ROUND_ACTIVE', 'ROUND_SETUP_SELF'];
        if (activeStatuses.includes(a.status) && !activeStatuses.includes(b.status)) {
            return -1;
        }

        if (!activeStatuses.includes(a.status) && activeStatuses.includes(b.status)) {
            return 1;
        }

        return (a.name || GameModeDisplayNames[a.gameMode]).localeCompare(b.name || GameModeDisplayNames[b.gameMode]);
    }, []);
    const activeGames = useMemo(
        () => lobbies.filter(l => l.status !== 'GAME_ENDED').sort(lobbiesSorter),
        [lobbies, lobbiesSorter],
    );

    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Open Settings" icon={MenuIcon} onPress={handleSettings} />
    );

    useEffect(() => {
        if (needsWelcomePrompt && offerWelcomePrompt && navigation) {
            const doOffer = async () => {
                if (await offerWelcomePrompt()) {
                    navigation.push('HowToPlayOffer');
                }
            };

            doOffer();
        }
    }, [needsWelcomePrompt, offerWelcomePrompt, navigation]);

    return (
        <ThemedSafeArea>
            <ScreenHeader accessoryRight={renderMenuAction} title="SWRDL - the Social Word game!" />
            <Divider />
            <View style={styles.root}>
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                        <ThemedRefreshControl refreshing={isRefreshingLobbies} onRefresh={handleManualRefresh} />
                    }
                >
                    <View style={{ height: 20 }} />
                    {waitingForLobbyUpdate && activeGames.length === 0 && (
                        <SkeletonLoader style={styles.loadingSkeleton} />
                    )}
                    {!waitingForLobbyUpdate && activeGames.length === 0 && (
                        <Layout level="2" style={styles.card}>
                            <Text category="h6">No Games</Text>
                            <Text category="p1">
                                You don&apos;t have any active games right now. Create one to get started!
                            </Text>
                            <Button style={styles.cardButton} onPress={handleCreate}>
                                Create a new game
                            </Button>
                        </Layout>
                    )}
                    {activeGames.map(l => (
                        <LobbyCard key={l.joinKey} joinKey={l.joinKey} />
                    ))}
                    <Layout>
                        <Text category="label" style={styles.sectionTitle}>
                            Play Now
                        </Text>
                        <ListItem
                            title="New Game"
                            description="Pick the game rules and invite others to join!"
                            onPress={handleCreate}
                            accessoryLeft={NewGameIcon}
                            accessoryRight={GoIcon}
                            activeOpacity={0.5}
                            testID="SettingsMainScreen.AccountRecovery.SetupRecovery"
                        />
                        <Divider />
                        <ListItem
                            title="Join Game"
                            description="Got a game code from someone?"
                            onPress={handleJoin}
                            accessoryLeft={JoinGameIcon}
                            accessoryRight={GoIcon}
                            activeOpacity={0.5}
                            testID="SettingsMainScreen.AccountRecovery.SwitchAccount"
                        />
                    </Layout>
                </ScrollView>
            </View>
        </ThemedSafeArea>
    );
}

export default HomeScreen;
