import { View } from 'react-native';
import { Text, useStyleSheet } from '@ui-kitten/components';
import { useLobby } from '@hooks/useLobby';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import { SetupWordInputProvider, useSetupWordInput } from '@hooks/useSetupWordInput';
import RoundSetupStyles from './RoundSetup.styles';
import LobbySetupWordInput from './LobbySetupWordInput';

interface SetupWordLetterProps {
    index: number;
}

function SetupWordLetter({ index }: SetupWordLetterProps) {
    const { word } = useSetupWordInput();
    const styles = useStyleSheet(RoundSetupStyles);

    return (
        <View style={styles.letterContainer}>
            <Text category="h1" adjustsFontSizeToFit>
                {word.charAt(index)}
            </Text>
        </View>
    );
}

interface Props {
    roundSequence: number;
    participantId: string;
}

function RoundSetup({ roundSequence, participantId }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const styles = useStyleSheet(RoundSetupStyles);
    const { lobby } = useLobby();
    const round = lobby?.rounds.find(r => r.sequence === roundSequence);
    const participant = round?.participants.find(p => p.user === participantId);

    if (!lobby || !round || !participant) {
        return null;
    }

    if (participant.shouldProvideWord && (round.word || participant.word)) {
        navigation.pop();
        return null;
    }

    return (
        <SetupWordInputProvider navigation={navigation}>
            <View style={styles.root}>
                {lobby.gameRules?.wordSource === 'pvp' && (
                    <View style={styles.explainer}>
                        <Text>
                            In Player vs. Player game modes, each player chooses the word their opponent will guess at
                            the beginning of each round.
                        </Text>
                        <Text category="s1" style={styles.explainerCTA}>
                            Please pick a word for your opponent.
                        </Text>
                    </View>
                )}
                {lobby.gameRules?.wordSource === 'one-player' && (
                    <View style={styles.explainer}>
                        <Text>
                            In Player-provided game modes, the word for each round is selected by one of the players at
                            random. You&apos;ve been chosen to provide the word for this round.
                        </Text>
                        <Text category="s1" style={styles.explainerCTA}>
                            Please pick a word for the rest of the lobby to play.
                        </Text>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <View style={styles.input}>
                        <SetupWordLetter index={0} />
                        <SetupWordLetter index={1} />
                        <SetupWordLetter index={2} />
                        <SetupWordLetter index={3} />
                        <SetupWordLetter index={4} />
                    </View>
                </View>
                <View>
                    <LobbySetupWordInput />
                </View>
            </View>
        </SetupWordInputProvider>
    );
}

export default RoundSetup;
