import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LobbyProvider } from '@hooks/useLobby';
import { memo } from 'react';
import Round from '@components/Round';
import { AuthedStackParamList } from './AuthedStackParamList';

type Props = NativeStackScreenProps<AuthedStackParamList, 'Round'>;

function RoundScreen({
    route: {
        params: { joinKey, roundSequence, participantId, isLive },
    },
}: Props) {
    return (
        <LobbyProvider joinKey={joinKey}>
            <Round roundSequence={roundSequence} participantId={participantId} isLive={isLive} />
        </LobbyProvider>
    );
}

export default memo(RoundScreen);
