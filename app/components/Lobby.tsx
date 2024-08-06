import ThemedSafeArea from '@components/ThemedSafeArea';
import useAppUser from '@hooks/useAppUser';
import { useLobby } from '@hooks/useLobby';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameModeDisplayNames } from '@root/util';
import { Divider, Icon, IconProps, TopNavigationAction } from '@ui-kitten/components';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';

import LobbyWaitingGameStart from '@components/LobbyWaitingGameStart';
import LobbyGameStarted from '@components/LobbyGameStarted';
import ScreenPlaceholder from '@components/ScreenPlaceholder';
import useNotifications from '@hooks/useNotifications';
import ScreenHeader from '@components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

interface Props {
    joinKey: string;
}

function Lobby({ joinKey }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const { lobby, isStartingGame } = useLobby() || {};
    const { appUser } = useAppUser();
    const { promptNotifications, hasNotificationPrompted, notificationsEnabled } = useNotifications();

    const renderBackAction = <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />;
    const title = useMemo(() => {
        if (!lobby) return 'Lobby';
        if (!lobby.name) return GameModeDisplayNames[lobby.gameMode];
        return lobby.name;
    }, [lobby]);

    useEffect(() => {
        if (!lobby || !appUser || notificationsEnabled || hasNotificationPrompted) return;

        const activeRound = lobby.rounds.find(r => r.active);
        if (!activeRound) return;

        const userParticipant = activeRound.participants.find(p => p.user === appUser.id);
        if (!userParticipant || !userParticipant.isDone) return;

        promptNotifications();
    }, [lobby, appUser, notificationsEnabled, hasNotificationPrompted, promptNotifications]);

    if (!lobby || !appUser || lobby.status === 'GAME_ENDED' || isStartingGame) {
        return <ScreenPlaceholder onBack={handleBack} />;
    }

    return (
        <ThemedSafeArea>
            <ScreenHeader title={title} accessoryLeft={renderBackAction} joinKey={joinKey} />
            <Divider />
            <View style={{ padding: 20, flex: 1 }}>
                {lobby.status === 'WAIT_GAME_START' && <LobbyWaitingGameStart />}
                {lobby.status !== 'WAIT_GAME_START' && <LobbyGameStarted />}
            </View>
        </ThemedSafeArea>
    );
}

export default memo(Lobby);
