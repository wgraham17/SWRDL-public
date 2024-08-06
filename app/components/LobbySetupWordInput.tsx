import { useSetupWordInput } from '@hooks/useSetupWordInput';
import { useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import { View } from 'react-native';
import LobbyGuessInputStyles from './LobbyGuessInput.styles';
import SetupKey from './SetupKey';

const KeyboardRow1 = Array.from('QWERTYUIOP');
const KeyboardRow2 = Array.from('ASDFGHJKL');
const KeyboardRow3 = Array.from('ZXCVBNM');

function LobbySetupWordInput() {
    const styles = useStyleSheet(LobbyGuessInputStyles);
    const { appendLetter, backspace, onSubmit } = useSetupWordInput();

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {KeyboardRow1.map(v => (
                    <SetupKey key={`key-${v}`} letter={v} onPress={() => appendLetter(v)} />
                ))}
            </View>
            <View style={styles.row}>
                {KeyboardRow2.map(v => (
                    <SetupKey key={`key-${v}`} letter={v} onPress={() => appendLetter(v)} />
                ))}
            </View>
            <View style={styles.row}>
                <SetupKey isEnter onPress={onSubmit} />
                {KeyboardRow3.map(v => (
                    <SetupKey key={`key-${v}`} letter={v} onPress={() => appendLetter(v)} />
                ))}
                <SetupKey isBackspace onPress={backspace} />
            </View>
        </View>
    );
}

export default memo(LobbySetupWordInput);
