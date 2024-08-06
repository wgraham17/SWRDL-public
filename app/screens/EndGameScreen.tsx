import ThemedSafeArea from '@components/ThemedSafeArea';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Divider, Icon, IconProps, Text, TopNavigationAction, useStyleSheet } from '@ui-kitten/components';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useLobby } from '@hooks/useLobby';
import ScreenHeader from '@components/ScreenHeader';
import { AuthedStackParamList } from './AuthedStackParamList';
import EndGameScreenStyles from './EndGameScreenStyles';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

type Props = NativeStackScreenProps<AuthedStackParamList, 'EndGame'>;

function EndGameScreen({ navigation }: Props) {
    const styles = useStyleSheet(EndGameScreenStyles);
    const { endGame, isEndingGame } = useLobby();
    const handleEndGame = useCallback(async () => {
        await endGame();
        navigation.popToTop();
    }, [endGame, navigation]);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const renderMenuAction = () => (
        <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
    );

    return (
        <ThemedSafeArea edges={['bottom', 'left', 'right']}>
            <ScreenHeader title="End Game" accessoryLeft={renderMenuAction} />
            <Divider />
            <View style={styles.root}>
                <Text>Are you sure you want to end this game?</Text>
                <Button disabled={isEndingGame} onPress={handleEndGame} style={styles.button}>
                    End Game
                </Button>
            </View>
        </ThemedSafeArea>
    );
}

export default memo(EndGameScreen);
