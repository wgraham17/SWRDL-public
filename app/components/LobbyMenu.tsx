import useAppUser from '@hooks/useAppUser';
import { useLobby } from '@hooks/useLobby';
import { Divider, Icon, IconProps, Layout, ListItem, Text, useStyleSheet } from '@ui-kitten/components';
import { useCallback, useState } from 'react';
import EndGameModal from './EndGameModal';
import GameRulesModal from './GameRulesModal';
import LeaveGameModal from './LeaveGameModal';
import LobbyMenuStyles from './LobbyMenu.styles';

function StartGameIcon(props: IconProps) {
    return <Icon {...props} name="play-circle" />;
}

function RulesIcon(props: IconProps) {
    return <Icon {...props} name="book" />;
}

function ShareIcon(props: IconProps) {
    return <Icon {...props} name="share" />;
}

function LeaveIcon(props: IconProps) {
    return <Icon {...props} name="log-out" />;
}

function EndGameIcon(props: IconProps) {
    return <Icon {...props} name="trash-2" />;
}

function GoIcon(props: IconProps) {
    return <Icon {...props} name="arrow-ios-forward" />;
}

function DisabledIcon(props: IconProps) {
    return <Icon {...props} name="minus" />;
}

function LobbyMenu() {
    const styles = useStyleSheet(LobbyMenuStyles);
    const { appUser } = useAppUser();
    const { lobby, startGame, isStartingGame, shareInvite } = useLobby();
    const [endGameModalOpen, setEndGameModalOpen] = useState(false);
    const [leaveGameModalOpen, setLeaveGameModalOpen] = useState(false);
    const [rulesModalOpen, setRulesModalOpen] = useState(false);
    const handleRules = useCallback(() => setRulesModalOpen(true), []);
    const handleInvite = useCallback(() => shareInvite(), [shareInvite]);
    const handleShowLeaveGame = useCallback(() => setLeaveGameModalOpen(true), []);
    const handleShowEndGame = useCallback(() => setEndGameModalOpen(true), []);
    const isHost = appUser?.id === lobby?.host;
    const isFull =
        lobby &&
        ((!lobby.gameRules && lobby.users.length >= 8) ||
            (lobby.gameRules && lobby.users.length >= lobby.gameRules.maxPlayers));
    const inviteTitle = isFull ? "Can't Invite (Full)" : 'Share Invite';
    const needsMorePlayers = lobby && lobby.gameRules && lobby.users.length < lobby.gameRules.minPlayers;

    return (
        <Layout level="1" style={styles.container}>
            <Text category="label" style={styles.title}>
                Lobby
            </Text>
            {isHost && lobby?.status === 'WAIT_GAME_START' && (
                <ListItem
                    title={needsMorePlayers ? "Can't start game" : 'Start Game'}
                    description={needsMorePlayers ? `Need ${lobby.gameRules?.minPlayers} players to start` : ''}
                    disabled={isStartingGame || needsMorePlayers}
                    onPress={startGame}
                    accessoryLeft={StartGameIcon}
                    accessoryRight={needsMorePlayers ? DisabledIcon : GoIcon}
                    activeOpacity={0.5}
                    testID="LobbyMenu.StartGame"
                />
            )}
            {isHost && lobby?.status === 'WAIT_GAME_START' && <Divider />}
            {lobby?.gameMode === 'custom' && (
                <ListItem
                    title="Game Rules"
                    onPress={handleRules}
                    accessoryLeft={RulesIcon}
                    accessoryRight={GoIcon}
                    activeOpacity={0.5}
                    testID="LobbyMenu.GameRules"
                />
            )}
            <Divider />
            <ListItem
                title={inviteTitle}
                onPress={handleInvite}
                disabled={isFull}
                accessoryLeft={ShareIcon}
                accessoryRight={isFull ? DisabledIcon : GoIcon}
                activeOpacity={0.5}
                testID="LobbyMenu.Invite"
            />
            <Divider />
            {isHost && (
                <ListItem
                    title="End Game"
                    onPress={handleShowEndGame}
                    accessoryLeft={EndGameIcon}
                    accessoryRight={GoIcon}
                    activeOpacity={0.5}
                    testID="LobbyMenu.EndGame"
                />
            )}
            {!isHost && (
                <ListItem
                    title="Leave Game"
                    onPress={handleShowLeaveGame}
                    accessoryLeft={LeaveIcon}
                    accessoryRight={GoIcon}
                    activeOpacity={0.5}
                    testID="LobbyMenu.LeaveGame"
                />
            )}
            <GameRulesModal open={rulesModalOpen} onClose={() => setRulesModalOpen(false)} />
            <EndGameModal open={endGameModalOpen} onClose={() => setEndGameModalOpen(false)} />
            <LeaveGameModal open={leaveGameModalOpen} onClose={() => setLeaveGameModalOpen(false)} />
        </Layout>
    );
}

export default LobbyMenu;
