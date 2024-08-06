import ThemedSafeArea from '@components/ThemedSafeArea';
import { Divider, Icon, IconProps, TopNavigationAction } from '@ui-kitten/components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLobby } from '@hooks/useLobby';
import { useCallback, useMemo } from 'react';
import { GameModeDisplayNames } from '@root/util';
import ScreenPlaceholder from '@components/ScreenPlaceholder';
import ScreenHeader from '@components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import RoundActive from './RoundActive';
import RoundSetup from './RoundSetup';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

interface Props {
    roundSequence: number;
    participantId: string;
    isLive: boolean;
}

function Round({ roundSequence, participantId, isLive }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const { lobby } = useLobby();
    const round = lobby?.rounds.find(r => r.sequence === roundSequence);
    const participant = round?.participants.find(p => p.user === participantId);
    const handleBack = useCallback(() => navigation.pop(), [navigation]);
    const renderMenuAction = useMemo(() => <TopNavigationAction icon={BackIcon} onPress={handleBack} />, [handleBack]);

    const title = useMemo(() => {
        if (!lobby || !round) return 'Round';
        if (!lobby.name) return `${GameModeDisplayNames[lobby.gameMode]} - Round ${round?.sequence}`;
        return `${lobby.name} - Round ${round?.sequence}`;
    }, [lobby, round]);

    const needsWordInput = participant?.shouldProvideWord && !participant.word && !round?.word;

    if (!lobby || !round || !participant) {
        return <ScreenPlaceholder onBack={handleBack} />;
    }

    return (
        <ThemedSafeArea>
            <ScreenHeader
                title={title}
                accessoryLeft={renderMenuAction}
                joinKey={lobby.joinKey}
                userId={participantId}
            />
            <Divider />
            {needsWordInput && <RoundSetup roundSequence={roundSequence} participantId={participantId} />}
            {!needsWordInput && (
                <RoundActive roundSequence={roundSequence} participantId={participantId} isLive={isLive} />
            )}
        </ThemedSafeArea>
    );
}

export default Round;
