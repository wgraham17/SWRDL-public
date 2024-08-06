import LobbyGuessRow from '@components/LobbyGuessRow';
import ScreenHeader from '@components/ScreenHeader';
import ThemedSafeArea from '@components/ThemedSafeArea';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Divider, Icon, IconProps, Text, TopNavigationAction, useStyleSheet } from '@ui-kitten/components';
import { memo, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import HowToPlayScreenStyles from './HowToPlayScreen.styles';

type Props = NativeStackScreenProps<never>;

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

function HowToPlayScreen({ navigation }: Props) {
    const styles = useStyleSheet(HowToPlayScreenStyles);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );

    return (
        <ThemedSafeArea edges={['bottom', 'right', 'left']}>
            <ScreenHeader title="How to Play SWRDL" accessoryLeft={renderMenuAction} />
            <Divider />
            <View style={styles.root}>
                <ScrollView style={styles.scrollView}>
                    <Text category="h5" style={styles.heading}>
                        Playing a Word
                    </Text>
                    <Text style={styles.para}>
                        The goal of SWRDL is to guess the hidden five-letter word in six tries or less. You can only
                        guess words in the English dictionary.
                    </Text>
                    <Text style={styles.para}>
                        When you submit your guess, you&apos;ll get feedback on how close you were.
                    </Text>
                    <Text style={styles.para}>
                        Letters in purple are in the correct spot. Letters in yellow are in the word but not in the
                        right spot. Letters without a color are not in the word.
                    </Text>
                    <View style={styles.exampleWord}>
                        <LobbyGuessRow word="DRAMA" mask="13233" />
                    </View>
                    <View style={styles.exampleWord}>
                        <Text category="h6">In this example:</Text>
                        <Text category="s1">› D is not in the word.</Text>
                        <Text category="s1">› R is in the correct spot.</Text>
                        <Text category="s1">› The first A is in the word but in the wrong spot.</Text>
                        <Text category="s1">› M and the second A are in the correct spot.</Text>
                    </View>
                    <Text style={styles.para}>Using this information, you might deduce that the word is AROMA.</Text>
                    <View style={styles.exampleWord}>
                        <LobbyGuessRow word="AROMA" mask="33333" />
                    </View>
                </ScrollView>
            </View>
        </ThemedSafeArea>
    );
}

export default memo(HowToPlayScreen);
