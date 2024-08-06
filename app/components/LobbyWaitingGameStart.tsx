import useAppUser from '@hooks/useAppUser';
import { useLobby } from '@hooks/useLobby';
import { Card, Divider, Icon, Text, useStyleSheet } from '@ui-kitten/components';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import LobbyWaitingGameStartStyles from './LobbyWaitingGameStart.styles';
import LobbyMember from './LobbyMember';
import InviteToLobbyButton from './InviteToLobbyButton';
import LobbyMenu from './LobbyMenu';

function Header() {
    const styles = useStyleSheet(LobbyWaitingGameStartStyles);
    return (
        <View style={styles.headerContainer}>
            <Icon name="clock" style={styles.headerIcon} />
            <Text category="label">Waiting to start...</Text>
        </View>
    );
}

function LobbyWaitingGameStart() {
    const { appUser } = useAppUser();
    const { lobby } = useLobby();
    const styles = useStyleSheet(LobbyWaitingGameStartStyles);
    const cardHeader = useMemo(() => <Header />, []);

    if (!lobby || !appUser) return null;

    const needsMorePlayers = lobby && lobby.gameRules && lobby.users.length < lobby.gameRules.minPlayers;

    return (
        <View>
            <Card disabled style={styles.playersHereCard} header={cardHeader}>
                {lobby.users.map(u => (
                    <LobbyMember id={u.id} isSelf={appUser.id === u.id} key={u.id} />
                ))}

                <View style={styles.inviteContainer}>
                    {lobby.users.length === 1 && !needsMorePlayers && (
                        <>
                            <Divider />
                            <Text style={styles.inviteMessage}>
                                Playing by yourself is fine but playing with your friends is better! Why not invite them
                                to join the fun by sending them the game code?
                            </Text>
                        </>
                    )}
                    {needsMorePlayers && lobby.gameRules && (
                        <>
                            <Divider />
                            <Text style={styles.inviteMessage}>
                                This game mode requires
                                {lobby.gameRules.maxPlayers > lobby.gameRules.minPlayers ? ' at least' : ''}{' '}
                                {lobby.gameRules.minPlayers} players to start the game. Why not invite someone?
                            </Text>
                        </>
                    )}
                    <InviteToLobbyButton />
                </View>
            </Card>
            <LobbyMenu />
        </View>
    );
}

export default memo(LobbyWaitingGameStart);
