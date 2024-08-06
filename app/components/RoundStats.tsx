import useAppUser from '@hooks/useAppUser';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lobby } from '@root/models';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import { Button, Icon, Layout, Text, useStyleSheet } from '@ui-kitten/components';
import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import RoundStatsStyles from './RoundStats.styles';
import RoundStatsTime from './RoundStatsTime';

interface Props {
    lobby: Lobby;
    roundSequence: number;
    participantId: string;
    navigation: NativeStackNavigationProp<AuthedStackParamList>;
}

function RoundStats({ lobby, roundSequence, participantId, navigation }: Props) {
    const styles = useStyleSheet(RoundStatsStyles);
    const { appUser } = useAppUser();

    const round = useMemo(() => lobby?.rounds.find(r => r.sequence === roundSequence), [lobby, roundSequence]);
    const isSelf = participantId === appUser?.id;
    const latestRound = useMemo(
        () => lobby?.rounds.reduce((prev, curr) => (curr.sequence > prev.sequence ? curr : prev), lobby.rounds[0]),
        [lobby],
    );
    const hasNextRound = latestRound && latestRound.sequence > roundSequence;
    const participant = useMemo(() => round?.participants.find(p => p.user === participantId), [round, participantId]);
    const canAdvanceToNextRound = hasNextRound && isSelf && roundSequence === latestRound.sequence - 1;

    const handleGoToNextGame = useCallback(() => {
        if (!latestRound) return;

        navigation.pop();
        navigation.push('Round', {
            joinKey: lobby.joinKey,
            roundSequence: latestRound.sequence,
            participantId,
            isLive: true,
        });
    }, [navigation, lobby, participantId, latestRound]);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);

    const word = useMemo(() => {
        let result = round?.word;
        if (lobby.gameMode === 'custom' && lobby.gameRules?.wordSource === 'pvp') {
            result = round?.participants.find(p => p.user !== participantId)?.word;
        }

        return result;
    }, [round, lobby, participantId]);

    return (
        <Layout level="2" style={styles.container}>
            <View style={styles.title}>
                <Icon name="award" style={styles.headerIcon} />
                <Text category="h3">{word?.toUpperCase() || ''}</Text>
            </View>
            {participant?.stats?.guessTime && (
                <View style={styles.timeContainer}>
                    <Text category="label">Time to Guess</Text>
                    <View style={styles.timeStatsContainer}>
                        <RoundStatsTime title="Total" value={participant.stats.guessTime.total} icon="clock" />
                        <RoundStatsTime title="Fastest" value={participant.stats.guessTime.min} icon="flash" />
                        <RoundStatsTime title="Slowest" value={participant.stats.guessTime.max} icon="arrowhead-left" />
                    </View>
                </View>
            )}
            <Button appearance="ghost" style={styles.action} onPress={handleBack}>
                Back to Lobby
            </Button>
            {canAdvanceToNextRound && (
                <Button style={styles.action} onPress={handleGoToNextGame}>
                    Next Round
                </Button>
            )}
        </Layout>
    );
}

export default memo(RoundStats);
