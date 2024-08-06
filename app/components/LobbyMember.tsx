import useUserName from '@hooks/useUserName';
import { Participant } from '@root/models';
import { FormatMsToReadable, FormatWithOrdinalIndicator } from '@root/util';
import { Text, useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import { View } from 'react-native';
import LobbyMemberStyles from './LobbyMember.styles';
import SkeletonLoader from './SkeletonLoader';
import UserAvatar from './UserAvatar';

interface Props {
    id: string;
    participant?: Participant | undefined;
    isSelf: boolean;
}

function LobbyMember({ id, isSelf, participant }: Props) {
    const styles = useStyleSheet(LobbyMemberStyles);
    const userName = useUserName(id);
    const getStatusText = () => {
        if (!participant) return 'Waiting for next round';
        if (participant.status === 'WAIT_GAME_START') return 'Waiting for game to start';
        if (participant.status === 'WAIT_NEXT_ROUND') return 'Waiting for next round';
        if (participant.status === 'ROUND_NOT_GUESSING') return 'Waiting for next round';
        if (participant.status === 'ROUND_SETUP_OTHERS') return 'Waiting for someone to pick a word';
        if (participant.status === 'ROUND_SETUP_SELF') return 'Picking a word to play';
        if (participant.status === 'ROUND_WON') {
            if (participant.stats?.guessTime && participant.stats.guessTime.total > 0) {
                const timeToWin = FormatMsToReadable(participant.stats.guessTime.total);
                return `Finished on ${FormatWithOrdinalIndicator(participant.guesses.length)} guess in ${timeToWin}`;
            }

            return `Finished on ${FormatWithOrdinalIndicator(participant.guesses.length)} guess`;
        }
        if (participant.status === 'ROUND_LOST') return 'Did Not Finish';
        if (participant.status === 'GAME_ENDED') return '';

        const currentGuessNumber = participant.guesses.length + 1;
        return `Playing on ${FormatWithOrdinalIndicator(currentGuessNumber)} guess`;
    };

    return (
        <View style={styles.container}>
            <UserAvatar style={styles.avatar} userId={id} />
            <View>
                <View style={styles.nameContainer}>
                    {!userName.isLoaded && <SkeletonLoader style={styles.skeleton} />}
                    {userName.isLoaded && (
                        <Text>
                            {userName.name}
                            {isSelf ? ' (you)' : ''}
                        </Text>
                    )}
                </View>
                <View style={styles.nameContainer}>
                    <Text category="c1">{getStatusText()}</Text>
                </View>
            </View>
        </View>
    );
}

LobbyMember.defaultProps = {
    participant: undefined,
};

export default memo(LobbyMember);
