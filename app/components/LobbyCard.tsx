import { Card, Text, useStyleSheet } from '@ui-kitten/components';
import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { GameModeDisplayNames, JoinKeyFormatter, StatusDisplayMessage } from '@root/util';
import useAppNavigation from '@hooks/useAppNavigation';
import useLobbyList from '@hooks/useLobbyList';
import LobbyCardStyles from './LobbyCard.styles';
import LobbyMemberSmall from './LobbyMemberSmall';
import LobbyAvatar from './LobbyAvatar';

interface Props {
    joinKey: string;
}

function LobbyCard({ joinKey }: Props) {
    const navigation = useAppNavigation();
    const { lobbies } = useLobbyList();
    const lobby = useMemo(() => lobbies.find(l => l.joinKey === joinKey), [lobbies, joinKey]);
    const styles = useStyleSheet(LobbyCardStyles);
    const handleGoToLobby = useCallback(() => navigation.push('Lobby', { joinKey }), [navigation, joinKey]);
    const title = useMemo(() => {
        if (!lobby) return 'Lobby';
        if (!lobby.name) return GameModeDisplayNames[lobby.gameMode];
        return lobby.name;
    }, [lobby]);

    if (!lobby) return null;

    const header = () => (
        <View style={styles.header}>
            <LobbyAvatar joinKey={joinKey} style={{ width: 40, height: 40, marginRight: 10 }} />
            <View>
                <Text category="h6">{title}</Text>
                <Text category="s2">#{JoinKeyFormatter(lobby.joinKey)}</Text>
            </View>
        </View>
    );

    return (
        <Card
            status={lobby.status === 'ROUND_ACTIVE' || lobby.status === 'ROUND_SETUP_SELF' ? 'primary' : 'basic'}
            header={header}
            style={styles.card}
            onPress={handleGoToLobby}
        >
            <Text>{StatusDisplayMessage[lobby.status]}</Text>
            <Text category="label" style={styles.membersLabel}>
                Players
            </Text>
            <View style={styles.membersContainer}>
                {lobby.users.map(user => (
                    <LobbyMemberSmall key={user.id} userId={user.id} />
                ))}
            </View>
        </Card>
    );
}

export default memo(LobbyCard);
