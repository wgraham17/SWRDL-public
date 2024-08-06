import { useLobby } from '@hooks/useLobby';
import { Card, Modal, Text, useStyleSheet } from '@ui-kitten/components';
import { View } from 'react-native';
import Animated, { ZoomInEasyDown } from 'react-native-reanimated';
import GameRulesModalStyles from './GameRulesModal.styles';
import ModalStyles from './Modal.styles';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface Props {
    open: boolean;
    onClose: () => void;
}

function GameRulesModal({ open, onClose }: Props) {
    const styles = useStyleSheet(GameRulesModalStyles);
    const modalStyles = useStyleSheet(ModalStyles);
    const { lobby } = useLobby();

    if (!lobby || !lobby.name || !lobby.gameRules) return null;

    const { name, gameRules } = lobby;
    const { wordSource, interval, minPlayers, maxPlayers, guessLimit, strict, maskResult } = gameRules;
    const getWordSourceDisplay = () => {
        if (wordSource === 'dictionary') return 'Dictionary';
        if (wordSource === 'one-player') return 'Player-provided';
        return 'PvP';
    };
    const getWordSourceDescription = () => {
        if (wordSource === 'dictionary') return 'Words are picked randomly from the dictionary for each round.';
        if (wordSource === 'one-player') return 'The word for each round is entered by a player.';
        return 'Both players pick a word for the other to guess.';
    };
    const getTiming = () => {
        if (interval === 'continuous') return 'Continuous';
        return 'Daily';
    };

    return (
        <Modal visible={open} backdropStyle={modalStyles.backdrop} onBackdropPress={onClose}>
            <AnimatedCard entering={ZoomInEasyDown} style={{ margin: 20, width: 350 }}>
                <Text category="h6">{name}</Text>
                <View style={styles.cardRule}>
                    <Text category="label" appearance="hint">
                        Word Source
                    </Text>
                    <Text category="c2">{getWordSourceDisplay()}</Text>
                </View>
                <Text category="p2">{getWordSourceDescription()}</Text>
                <View style={styles.cardRule}>
                    <Text category="label" appearance="hint">
                        Timing
                    </Text>
                    <Text category="c2">{getTiming()}</Text>
                </View>
                <View style={styles.cardRule}>
                    <Text category="label" appearance="hint">
                        Players
                    </Text>
                    <Text category="c2">
                        {minPlayers}
                        {minPlayers !== maxPlayers ? ` - ${maxPlayers}` : ''}
                    </Text>
                </View>
                <View style={styles.cardRule}>
                    <Text category="label" appearance="hint">
                        Guess Rules
                    </Text>
                    {guessLimit && (
                        <Text category="c2">
                            Limit {guessLimit} guesses
                            {strict ? ' (strict mode)' : ''}
                        </Text>
                    )}
                    {!guessLimit && (
                        <Text category="c2">
                            Unlimited guesses
                            {strict ? ' (strict mode)' : ''}
                        </Text>
                    )}
                </View>
                <View style={styles.cardRule}>
                    <View />
                    <Text category="c2">
                        {maskResult === 'position' ? 'Full guess feedback' : 'Cow/Bull guess feedback'}
                    </Text>
                </View>
            </AnimatedCard>
        </Modal>
    );
}

export default GameRulesModal;
