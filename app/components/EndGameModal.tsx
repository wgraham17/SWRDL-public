import { useLobby } from '@hooks/useLobby';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import { Button, Card, Modal, Spinner, Text, useStyleSheet } from '@ui-kitten/components';
import { useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { ZoomInEasyDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import ModalStyles from './Modal.styles';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface Props {
    open: boolean;
    onClose: () => void;
}

function EndGameModal({ open, onClose }: Props) {
    const modalStyles = useStyleSheet(ModalStyles);
    const { endGame, isEndingGame } = useLobby() || {};
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const handleEndGame = useCallback(async () => {
        await endGame();
        navigation.popToTop();
        Toast.show({
            type: 'success',
            text1: 'Game Ended',
        });
    }, [endGame, navigation]);
    const renderHeader = useCallback(
        (props: ViewProps | undefined) => (
            <Text category="h6" {...props}>
                End Game
            </Text>
        ),
        [],
    );
    const renderFooter = useCallback(
        (props: ViewProps | undefined) => (
            <View {...props}>
                <Button appearance="ghost" status="basic" style={modalStyles.footerButton} onPress={onClose}>
                    Nevermind
                </Button>
                <Button onPress={handleEndGame} style={modalStyles.footerButton}>
                    End Game
                </Button>
            </View>
        ),
        [modalStyles, onClose, handleEndGame],
    );

    return (
        <Modal visible={open} backdropStyle={modalStyles.backdrop} onBackdropPress={onClose}>
            {!isEndingGame && (
                <AnimatedCard
                    disabled
                    entering={ZoomInEasyDown}
                    style={{ margin: 20 }}
                    header={renderHeader}
                    footer={renderFooter}
                >
                    <Text>Are you sure? The game will end immediately and everyone in the lobby will be ejected.</Text>
                </AnimatedCard>
            )}
            {isEndingGame && <Spinner size="giant" />}
        </Modal>
    );
}

export default EndGameModal;
