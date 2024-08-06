import ScreenHeader from '@components/ScreenHeader';
import ScreenPlaceholder from '@components/ScreenPlaceholder';
import ThemedSafeArea from '@components/ThemedSafeArea';
import { useLobby } from '@hooks/useLobby';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GameModeDisplayNames } from '@root/util';
import { Divider, Icon, IconProps, TopNavigationAction } from '@ui-kitten/components';
import { useCallback, useMemo } from 'react';
import { AuthedStackParamList } from './AuthedStackParamList';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

type Props = NativeStackScreenProps<AuthedStackParamList, 'LobbyStats'>;

function LobbyStatsScreen({ navigation }: Props) {
    const { lobby } = useLobby();
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const renderBackAction = <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />;
    const title = useMemo(() => {
        if (!lobby) return 'Lobby';
        return GameModeDisplayNames[lobby.gameMode];
    }, [lobby]);

    if (!lobby) return <ScreenPlaceholder onBack={handleBack} />;

    return (
        <ThemedSafeArea edges={['bottom', 'right', 'left']}>
            <ScreenHeader title={title} accessoryLeft={renderBackAction} joinKey={lobby.joinKey} />
            <Divider />
        </ThemedSafeArea>
    );
}

export default LobbyStatsScreen;
