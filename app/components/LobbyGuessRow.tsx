import { useGuessInput } from '@hooks/useGuessInput';
import { Text, useStyleSheet } from '@ui-kitten/components';
import { memo, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    cancelAnimation,
    Layout,
    PinwheelIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    ZoomIn,
} from 'react-native-reanimated';
import LobbyGuessRowStyles from './LobbyGuessRow.styles';

interface Props {
    isInputRow?: boolean | undefined;
    mask: string;
    word: string;
    sequence?: number | undefined;
    isLimitedMask?: boolean | undefined;
}

function LobbyGuessRow({ isInputRow, mask, word, sequence, isLimitedMask }: Props) {
    const { isSubmittingGuess, wasGuessInvalid } = useGuessInput();
    const vibrate = useSharedValue(0);
    const inputStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: vibrate.value * 10 }],
    }));
    const styles = useStyleSheet(LobbyGuessRowStyles);
    const textAppearance = isSubmittingGuess && isInputRow ? 'hint' : 'default';

    const LobbyGuessRowLetter = useCallback(
        ({ index }) => (
            <View style={styles.letterContainer}>
                {!isLimitedMask && mask.charAt(index) === '1' && (
                    <Animated.View entering={PinwheelIn.delay(200 * index)} style={[styles.mask, styles.mask1]} />
                )}
                {!isLimitedMask && mask.charAt(index) === '2' && (
                    <Animated.View entering={PinwheelIn.delay(200 * index)} style={[styles.mask, styles.mask2]} />
                )}
                {(!isLimitedMask || mask === '33333') && mask.charAt(index) === '3' && (
                    <Animated.View entering={PinwheelIn.delay(200 * index)} style={[styles.mask, styles.mask3]} />
                )}
                <Text category="h1" appearance={textAppearance} style={styles.letter} adjustsFontSizeToFit>
                    {word.charAt(index)}
                </Text>
            </View>
        ),
        [styles, textAppearance, mask, word, isLimitedMask],
    );

    useEffect(() => {
        if (isInputRow && wasGuessInvalid) {
            vibrate.value = withRepeat(
                withSequence(
                    withTiming(-1, { duration: 35 }),
                    withTiming(1, { duration: 70 }),
                    withTiming(0, { duration: 35 }),
                ),
                2,
                undefined,
                () => cancelAnimation(vibrate),
            );
        }
    }, [vibrate, isInputRow, wasGuessInvalid]);

    const numCorrect = [...mask].filter(c => c === '3').length;
    const numInWord = [...mask].filter(c => c === '2').length;

    return (
        <Animated.View entering={ZoomIn} layout={Layout}>
            <Animated.View
                style={[
                    styles.container,
                    isInputRow ? inputStyle : null,
                    isInputRow && isLimitedMask ? styles.bufferBottom : null,
                ]}
            >
                {sequence && (
                    <View
                        style={[
                            styles.guessNumber,
                            isLimitedMask && !isInputRow && mask ? styles.guessNumberWithMask : null,
                        ]}
                    >
                        <Text category="label">{sequence}</Text>
                        {isLimitedMask && !isInputRow && mask && (
                            <View style={styles.maskResultContainer}>
                                {numCorrect > 0 && (
                                    <View style={[styles.maskResult, styles.mask3]}>
                                        <Text category="c2" style={styles.maskResultText}>
                                            {numCorrect}
                                        </Text>
                                    </View>
                                )}
                                {numInWord > 0 && (
                                    <View style={[styles.maskResult, styles.mask2]}>
                                        <Text category="c2" style={styles.maskResultText}>
                                            {numInWord}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}
                <LobbyGuessRowLetter index={0} />
                <LobbyGuessRowLetter index={1} />
                <LobbyGuessRowLetter index={2} />
                <LobbyGuessRowLetter index={3} />
                <LobbyGuessRowLetter index={4} />
            </Animated.View>
        </Animated.View>
    );
}

LobbyGuessRow.defaultProps = {
    isInputRow: false,
    sequence: undefined,
    isLimitedMask: false,
};

export default memo(LobbyGuessRow);
