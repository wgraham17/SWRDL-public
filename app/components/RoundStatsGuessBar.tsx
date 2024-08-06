import { AttemptStats } from '@root/models';
import { Text, useStyleSheet } from '@ui-kitten/components';
import { View } from 'react-native';
import RoundStatsGuessBarStyles from './RoundStatsGuessBar.styles';

interface Props {
    guessNumber: number;
    guessAttempts: AttemptStats[];
    maxTimesWon: number;
}

function RoundStatsGuessBar({ guessAttempts, guessNumber, maxTimesWon }: Props) {
    const styles = useStyleSheet(RoundStatsGuessBarStyles);
    const timesWon = guessAttempts.find(a => a.guessNumber === guessNumber)?.timesWonAtGuessNumber || 0;

    return (
        <View style={styles.container}>
            <Text category="s1" style={styles.title}>
                {guessNumber === -1 ? 'X' : guessNumber}
            </Text>
            <View style={styles.bar}>
                <View
                    style={[
                        styles.filled,
                        {
                            flex: timesWon || 0,
                        },
                    ]}
                >
                    <Text category="c2" style={{ color: 'white' }}>
                        {timesWon}
                    </Text>
                </View>
                <View
                    style={[
                        styles.empty,
                        {
                            flex: maxTimesWon - timesWon || 0,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

export default RoundStatsGuessBar;
