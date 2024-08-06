import { useGuessInput } from '@hooks/useGuessInput';
import { Icon, Text, useStyleSheet, useTheme } from '@ui-kitten/components';
import { memo, useCallback } from 'react';
import { BorderlessButton } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useColorScheme, View } from 'react-native';
import { useLobby } from '@hooks/useLobby';
import KeyStyles from './Key.styles';

interface Props {
    letter?: string | undefined;
    isEnter?: boolean | undefined;
    isBackspace?: boolean | undefined;
    onPress: () => void;
    letterMask?: '2' | '3' | undefined;
}

function Key({ letter, isEnter, isBackspace, letterMask, onPress }: Props) {
    const { lobby } = useLobby();
    const { guess, isSubmittingGuess, disabledLetters, canGuess } = useGuessInput();
    const colorScheme = useColorScheme();
    const styles = useStyleSheet(KeyStyles);
    const primaryColor = useTheme()['color-primary-500'];
    const keyEnabled = canGuess && !isSubmittingGuess && guess.length < 5;
    const isDisabledLetter = keyEnabled && disabledLetters.has(letter || '%');
    const enterEnabled = canGuess && !isSubmittingGuess && guess.length === 5;
    const backspaceEnabled = canGuess && !isSubmittingGuess && guess.length > 0;
    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress]);
    const enabledStyle = () => {
        if (lobby?.gameMode === 'custom' && lobby.gameRules?.maskResult === 'existence') return null;
        if (letterMask === '3') return styles.buttonCorrect;
        if (letterMask === '2') return styles.buttonContained;
        return null;
    };

    if (letter) {
        let keyAppearance = letterMask === '3' && colorScheme === 'light' ? 'alternative' : 'default';

        if (!keyEnabled) {
            keyAppearance = 'hint';
        }

        return (
            <BorderlessButton
                activeOpacity={0.5}
                rippleColor={primaryColor}
                enabled={keyEnabled}
                exclusive={false}
                borderless={false}
                style={[styles.button, !keyEnabled || isDisabledLetter ? styles.buttonDisabled : enabledStyle()]}
                onPress={handlePress}
            >
                <View accessible accessibilityRole="button">
                    <Text category="s1" appearance={keyAppearance}>
                        {letter}
                    </Text>
                </View>
            </BorderlessButton>
        );
    }

    if (isEnter) {
        return (
            <BorderlessButton
                activeOpacity={0.5}
                rippleColor={primaryColor}
                enabled={enterEnabled}
                exclusive={false}
                borderless={false}
                style={[styles.button, styles.iconButton, enterEnabled ? null : styles.buttonDisabled]}
                onPress={handlePress}
            >
                <View accessible accessibilityRole="button">
                    <Text category="c1" appearance={enterEnabled ? 'default' : 'hint'}>
                        GUESS
                    </Text>
                </View>
            </BorderlessButton>
        );
    }

    if (isBackspace) {
        return (
            <BorderlessButton
                activeOpacity={0.5}
                rippleColor={primaryColor}
                enabled={backspaceEnabled}
                exclusive={false}
                borderless={false}
                style={[styles.button, styles.iconButton, backspaceEnabled ? null : styles.buttonDisabled]}
                onPress={handlePress}
            >
                <View accessible accessibilityRole="button" accessibilityLabel="Backspace">
                    <Icon name="backspace" style={[styles.icon, backspaceEnabled ? null : styles.iconDisabled]} />
                </View>
            </BorderlessButton>
        );
    }

    return null;
}

Key.defaultProps = {
    letter: undefined,
    isEnter: undefined,
    isBackspace: undefined,
    letterMask: undefined,
};

export default memo(Key);
