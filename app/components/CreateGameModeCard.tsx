import { GameMode } from '@root/models';
import { Card, Text, useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, Layout, LightSpeedOutLeft } from 'react-native-reanimated';
import { GameModeDisplayNames } from '@root/util';
import CreateGameModeCardStyles from './CreateGameModeCard.styles';

interface Props {
    index: number;
    gameMode: GameMode;
    wordSource: string;
    minPlayers: number;
    maxPlayers: number;
    guessLimit: number;
    strict: boolean;
    maskResult: 'position' | 'existence';
    schedule: string;
    disabled?: boolean | undefined;
    selected?: boolean | undefined;
    onPress: () => void;
}

function CreateGameModeCard({
    index,
    gameMode,
    wordSource,
    schedule,
    minPlayers,
    maxPlayers,
    guessLimit,
    strict,
    maskResult,
    disabled,
    selected,
    onPress,
}: Props) {
    const styles = useStyleSheet(CreateGameModeCardStyles);

    return (
        <Animated.View entering={FadeIn.delay(200 * index)} exiting={LightSpeedOutLeft} layout={Layout}>
            <Card
                status={selected ? 'primary' : 'basic'}
                style={styles.card}
                disabled={disabled || selected}
                onPress={onPress}
            >
                <Text category="h6">{GameModeDisplayNames[gameMode]}</Text>
                <View>
                    <View style={styles.cardRule}>
                        <Text category="label" appearance="hint">
                            Word Source
                        </Text>
                        <Text category="c2">{wordSource}</Text>
                    </View>
                    <View style={styles.cardRule}>
                        <Text category="label" appearance="hint">
                            Timing
                        </Text>
                        <Text category="c2">{schedule}</Text>
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
                        <Text category="c2">
                            Limit {guessLimit} guesses
                            {strict ? ' (strict mode)' : ''}
                        </Text>
                    </View>
                    <View style={styles.cardRule}>
                        <View />
                        <Text category="c2">
                            {maskResult === 'position' ? 'Full guess feedback' : 'Cow/Bull guess feedback'}
                        </Text>
                    </View>
                </View>
            </Card>
        </Animated.View>
    );
}

CreateGameModeCard.defaultProps = {
    disabled: false,
    selected: false,
};

export default memo(CreateGameModeCard);
