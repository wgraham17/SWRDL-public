import { Icon, Text, useStyleSheet, useTheme } from '@ui-kitten/components';
import { memo, useCallback } from 'react';
import { BorderlessButton } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';
import { useSetupWordInput } from '@hooks/useSetupWordInput';
import KeyStyles from './Key.styles';

interface Props {
    letter?: string | undefined;
    isEnter?: boolean | undefined;
    isBackspace?: boolean | undefined;
    onPress: () => void;
}

function SetupKey({ letter, isEnter, isBackspace, onPress }: Props) {
    const { word, isSubmittingWord } = useSetupWordInput();
    const styles = useStyleSheet(KeyStyles);
    const primaryColor = useTheme()['color-primary-500'];
    const keyEnabled = !isSubmittingWord && word.length < 5;
    const enterEnabled = !isSubmittingWord && word.length === 5;
    const backspaceEnabled = !isSubmittingWord && word.length > 0;
    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress]);

    if (letter) {
        let keyAppearance = 'default';

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
                style={[styles.button, !keyEnabled ? styles.buttonDisabled : null]}
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
                        SUBMIT
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

SetupKey.defaultProps = {
    letter: undefined,
    isEnter: undefined,
    isBackspace: undefined,
};

export default memo(SetupKey);
