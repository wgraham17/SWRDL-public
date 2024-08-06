import { useLobby } from '@hooks/useLobby';
import { View } from 'react-native';
import { Text, useStyleSheet } from '@ui-kitten/components';
import { FlatList } from 'react-native-gesture-handler';
import LobbyMenu from './LobbyMenu';
import LobbyRoundCard from './LobbyRoundCard';
import LobbyGameStartedStyles from './LobbyGameStarted.styles';
import LobbyNextWordWaitMessage from './LobbyNextWordWaitMessage';

function LobbyGameStarted() {
    const styles = useStyleSheet(LobbyGameStartedStyles);
    const { lobby } = useLobby();

    if (!lobby) return null;

    const roundsDesc = [...lobby.rounds].sort((a, b) => b.sequence - a.sequence);
    let roundHistory = [...roundsDesc];
    const isCurrentRoundComplete = !roundsDesc[0].active || roundsDesc[0].participants.every(p => p.isDone);

    if (!isCurrentRoundComplete) {
        roundHistory = roundHistory.slice(1);
    }

    return (
        <View style={{ flex: 1 }}>
            {!isCurrentRoundComplete && <LobbyRoundCard lobby={lobby} round={roundsDesc[0]} />}
            {isCurrentRoundComplete && (
                <LobbyNextWordWaitMessage
                    expectedEndDate={roundsDesc[0].expectedEndDate}
                    nextSequence={roundsDesc[0].sequence + 1}
                />
            )}
            <LobbyMenu />
            {roundHistory.length > 0 && (
                <Text category="label" style={styles.historyTitle}>
                    Round History
                </Text>
            )}
            <FlatList
                initialNumToRender={4}
                data={roundHistory}
                renderItem={({ item }) => (
                    <LobbyRoundCard lobby={lobby} round={item} key={`${lobby.joinKey}-${item.sequence}`} isHistory />
                )}
            />
        </View>
    );
}

export default LobbyGameStarted;
