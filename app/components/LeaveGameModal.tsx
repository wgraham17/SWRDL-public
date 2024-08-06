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

function LeaveGameModal({ open, onClose }: Props) {
    const modalStyles = useStyleSheet(ModalStyles);
    const { leaveGame, isLeavingGame } = useLobby() || {};
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const handleLeaveGame = useCallback(async () => {
        leaveGame();
        navigation.popToTop();
        Toast.show({
            type: 'success',
            text1: 'Left Game',
        });
    }, [leaveGame, navigation]);
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
                <Button onPress={handleLeaveGame} style={modalStyles.footerButton}>
                    Leave Game
                </Button>
            </View>
        ),
        [modalStyles, onClose, handleLeaveGame],
    );

    return (
        <Modal visible={open} backdropStyle={modalStyles.backdrop} onBackdropPress={onClose}>
            {!isLeavingGame && (
                <AnimatedCard
                    disabled
                    entering={ZoomInEasyDown}
                    style={{ margin: 20 }}
                    header={renderHeader}
                    footer={renderFooter}
                >
                    <Text>Are you sure? You&apos;ll need to be invited again to rejoin.</Text>
                </AnimatedCard>
            )}
            {isLeavingGame && <Spinner size="giant" />}
        </Modal>
    );
}

export default LeaveGameModal;
