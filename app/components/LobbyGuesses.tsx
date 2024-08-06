import { useGuessInput } from '@hooks/useGuessInput';
import { useLobby } from '@hooks/useLobby';
import { Round } from '@root/models';
import { useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import Animated, { Layout } from 'react-native-reanimated';
import LobbyGuessesStyles from './LobbyGuesses.styles';
import LobbyGuessRow from './LobbyGuessRow';

interface Props {
    round: Round;
    participantId: string;
}

function LobbyGuesses({ round, participantId }: Props) {
    const styles = useStyleSheet(LobbyGuessesStyles);
    const { lobby } = useLobby();
    const { guess, guessKey } = useGuessInput();
    const userParticipant = round.participants.find(p => p.user === participantId);
    const userGuesses = [...(userParticipant?.guesses || [])].sort((a, b) => b.guessKey - a.guessKey);
    const showInputRow = round.active && !userParticipant?.isDone;

    if (!lobby || !round || !userGuesses) {
        return null;
    }

    const isLimitedMask = lobby.gameMode === 'custom' && lobby.gameRules?.maskResult === 'existence';

    return (
        <Animated.View style={styles.container} layout={Layout}>
            {showInputRow && (
                <LobbyGuessRow
                    isInputRow
                    word={guess}
                    mask="00000"
                    sequence={userGuesses.length + 1}
                    isLimitedMask={isLimitedMask}
                />
            )}
            {userGuesses.map((g, idx) => {
                if (g.guessKey === guessKey) {
                    return null;
                }

                return (
                    <LobbyGuessRow
                        key={`existing-${g.guessKey}`}
                        word={g.word || ''}
                        mask={g.mask}
                        sequence={userGuesses.length - idx}
                        isLimitedMask={isLimitedMask}
                    />
                );
            })}
        </Animated.View>
    );
}

export default memo(LobbyGuesses);
