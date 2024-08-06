import { View } from 'react-native';
import { Button, Card, Layout, Text, useStyleSheet } from '@ui-kitten/components';
import Animated, { FadeIn, Layout as LayoutTransition, LightSpeedOutLeft, runOnJS } from 'react-native-reanimated';
import { useCallback, useEffect, useState } from 'react';
import { CustomLobbyGameRules, Interval, MaskResult, WordSource } from '@root/models';
import CreateCustomGameStyles from './CreateCustomGame.styles';
import CustomRadioGroup, { Option } from './CustomRadioGroup';

const AnimatedButton = Animated.createAnimatedComponent(Button);

const WordSourceOptions: Option[] = [
    {
        name: 'Dictionary',
        value: 'dictionary',
        helpText: 'Words are picked randomly from the dictionary for each round.',
    },
    {
        name: 'Player-provided',
        value: 'one-player',
        helpText: 'The word for each round is entered by another player. Requires 2 or more people in the game.',
    },
    {
        name: 'Player vs. Player',
        value: 'pvp',
        helpText: 'Both players pick a word for the other to guess. Only supports 2 people in the game.',
    },
];

const FrequencyOptions: Option[] = [
    {
        name: 'Continuous',
        value: 'continuous',
        helpText: 'New round as soon as everyone finishes.',
    },
    {
        name: 'Daily',
        value: 'daily',
        helpText: 'New round every day at midnight.',
    },
];

const MaskResultOptions: Option[] = [
    {
        name: 'Classic',
        value: 'position',
        helpText: 'Feedback from each guess tells you which letter was in the word or in the correct spot.',
    },
    {
        name: 'Hardcore',
        value: 'existence',
        helpText:
            'You only get feedback on how many letters are in the word or in the right spot, but not the actual letters.',
    },
];

const GuessRestrictionOptions: Option[] = [
    {
        name: 'Normal',
        value: 'false',
        helpText: 'No restrictions on subsequent guesses.',
    },
    {
        name: 'Hard Mode',
        value: 'true',
        helpText: 'After a guess, you must use the correct letters in your next guess.',
    },
];

const GuessLimitOptions: Option[] = [
    {
        name: 'Capped at 6',
        value: 'capped',
        helpText: 'You have 6 attempts to guess the correct word.',
    },
    {
        name: 'Unlimited',
        value: 'unlimited',
        helpText: 'You have an unlimited number of guesses.',
    },
];

interface Props {
    index: number;
    selected?: boolean | undefined;
    onPress: () => void;
    onScrollRequested: () => void;
    onCreate: (gameRules: CustomLobbyGameRules) => void;
}

function CreateCustomGame({ index, selected, onPress, onScrollRequested, onCreate }: Props) {
    const styles = useStyleSheet(CreateCustomGameStyles);
    const [wordSource, setWordSource] = useState<Option>();
    const handleSetWordSource = useCallback((val: Option) => setWordSource(val), []);
    const [frequency, setFrequency] = useState<Option>();
    const handleSetFrequency = useCallback((val: Option) => setFrequency(val), []);
    const [maskResult, setMaskResult] = useState<Option>();
    const handleSetMaskResult = useCallback((val: Option) => setMaskResult(val), []);
    const [guessRestriction, setGuessRestriction] = useState<Option>();
    const handleSetGuessRestriction = useCallback((val: Option) => setGuessRestriction(val), []);
    const [guessLimit, setGuessLimit] = useState<Option>();
    const handleSetGuessLimit = useCallback((val: Option) => setGuessLimit(val), []);
    const handleCreate = useCallback(() => {
        if (!wordSource || !frequency || !maskResult || !guessRestriction || !guessLimit) return;

        const gameRules: CustomLobbyGameRules = {
            wordSource: wordSource.value as WordSource,
            minPlayers: wordSource.value === 'dictionary' ? 1 : 2,
            maxPlayers: wordSource.value === 'pvp' ? 2 : 8,
            interval: frequency.value as Interval,
            guessLimit: guessLimit.value === 'capped' ? 6 : undefined,
            maskResult: maskResult.value as MaskResult,
            strict: guessRestriction.value === 'true',
        };
        onCreate(gameRules);
    }, [onCreate, wordSource, frequency, maskResult, guessRestriction, guessLimit]);
    const animationEnter = FadeIn.duration(200).withCallback(() => {
        'worklet';

        runOnJS(onScrollRequested)();
    });

    useEffect(() => {
        if (selected) return;
        setWordSource(undefined);
        setFrequency(undefined);
        setMaskResult(undefined);
        setGuessRestriction(undefined);
        setGuessLimit(undefined);
    }, [selected]);

    useEffect(() => {
        if (maskResult?.value === 'existence') {
            setGuessRestriction(GuessRestrictionOptions.find(v => v.value === 'false'));
        }
    }, [maskResult]);

    return (
        <Animated.View entering={FadeIn.delay(200 * index)} exiting={LightSpeedOutLeft} layout={LayoutTransition}>
            {!selected && (
                <Text category="label" style={styles.header}>
                    Build Your Own
                </Text>
            )}
            <View>
                <Card status={selected ? 'primary' : 'basic'} style={styles.card} disabled={selected} onPress={onPress}>
                    <Text category="h6">Custom Game Mode</Text>
                    <Text appearance={selected ? 'default' : 'hint'} style={styles.para}>
                        Pick the rules and build your own game mode. Customize the word selection and difficulty. Turn
                        on or off feedback for each guess.
                    </Text>
                    <Text appearance={selected ? 'default' : 'hint'} category="s1" style={styles.para}>
                        Make it yours!
                    </Text>
                </Card>
            </View>
            {selected && (
                <Layout level="2" style={styles.container}>
                    <Text category="h6">Build Game Mode</Text>
                    <View style={styles.field}>
                        <Text category="s1">Word Source</Text>
                        <CustomRadioGroup
                            options={WordSourceOptions}
                            selectedOption={wordSource}
                            onChange={handleSetWordSource}
                        />
                    </View>
                    {wordSource && (
                        <Animated.View entering={animationEnter} style={styles.field}>
                            <Text category="s1">Frequency</Text>
                            <CustomRadioGroup
                                options={FrequencyOptions}
                                selectedOption={frequency}
                                onChange={handleSetFrequency}
                            />
                        </Animated.View>
                    )}
                    {frequency && (
                        <Animated.View entering={animationEnter} style={styles.field}>
                            <Text category="s1">Guess Feedback</Text>
                            <CustomRadioGroup
                                options={MaskResultOptions}
                                selectedOption={maskResult}
                                onChange={handleSetMaskResult}
                            />
                        </Animated.View>
                    )}
                    {maskResult && maskResult.value !== 'existence' && (
                        <Animated.View entering={animationEnter} style={styles.field}>
                            <Text category="s1">Guess Restrictions</Text>
                            <CustomRadioGroup
                                options={GuessRestrictionOptions}
                                selectedOption={guessRestriction}
                                onChange={handleSetGuessRestriction}
                            />
                        </Animated.View>
                    )}
                    {guessRestriction && (
                        <Animated.View entering={animationEnter} style={styles.field}>
                            <Text category="s1">Guess Limit</Text>
                            <CustomRadioGroup
                                options={GuessLimitOptions}
                                selectedOption={guessLimit}
                                onChange={handleSetGuessLimit}
                            />
                        </Animated.View>
                    )}
                    {guessLimit && (
                        <AnimatedButton style={styles.createButton} entering={animationEnter} onPress={handleCreate}>
                            Create Custom Game
                        </AnimatedButton>
                    )}
                </Layout>
            )}
        </Animated.View>
    );
}

CreateCustomGame.defaultProps = {
    selected: false,
};

export default CreateCustomGame;
