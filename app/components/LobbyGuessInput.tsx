import useAppUser from '@hooks/useAppUser';
import { useGuessInput } from '@hooks/useGuessInput';
import { Participant } from '@root/models';
import { useStyleSheet } from '@ui-kitten/components';
import { memo, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Key from './Key';
import LobbyGuessInputStyles from './LobbyGuessInput.styles';

const KeyboardRow1 = Array.from('QWERTYUIOP');
const KeyboardRow2 = Array.from('ASDFGHJKL');
const KeyboardRow3 = Array.from('ZXCVBNM');

interface Props {
    participant: Participant | null;
}

type LetterMaskValue = '2' | '3';

function LobbyGuessInput({ participant }: Props) {
    const styles = useStyleSheet(LobbyGuessInputStyles);
    const { appUser } = useAppUser();
    const { appendLetter, backspace, onSubmit, startStopwatch, pauseStopwatch } = useGuessInput();
    const letterMasks = useMemo(() => {
        let result: Record<string, LetterMaskValue> = {};
        if (!participant) return result;

        result = participant.letterMasks.correct.reduce(
            (prev, curr) => ({ ...prev, [curr]: '3' as LetterMaskValue }),
            result,
        );
        result = participant.letterMasks.contained.reduce(
            (prev, curr) => ({ ...prev, [curr]: '2' as LetterMaskValue }),
            result,
        );

        return result;
    }, [participant]);
    const isSelf = useMemo(() => participant && appUser && participant.user === appUser.id, [participant, appUser]);

    useEffect(() => {
        if (participant && !participant.isDone && isSelf) {
            startStopwatch();
            return () => pauseStopwatch();
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }, [participant, isSelf, startStopwatch, pauseStopwatch]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {KeyboardRow1.map(v => (
                    <Key key={`key-${v}`} letter={v} onPress={() => appendLetter(v)} letterMask={letterMasks[v]} />
                ))}
            </View>
            <View style={styles.row}>
                {KeyboardRow2.map(v => (
                    <Key key={`key-${v}`} letter={v} onPress={() => appendLetter(v)} letterMask={letterMasks[v]} />
                ))}
            </View>
            <View style={styles.row}>
                <Key isEnter onPress={onSubmit} />
                {KeyboardRow3.map(v => (
                    <Key key={`key-${v}`} letter={v} onPress={() => appendLetter(v)} letterMask={letterMasks[v]} />
                ))}
                <Key isBackspace onPress={backspace} />
            </View>
        </View>
    );
}

export default memo(LobbyGuessInput);
