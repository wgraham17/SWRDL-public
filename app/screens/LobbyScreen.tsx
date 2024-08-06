import { LobbyProvider } from '@hooks/useLobby';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Lobby from '@components/Lobby';
import { AuthedStackParamList } from './AuthedStackParamList';

type Props = NativeStackScreenProps<AuthedStackParamList, 'Lobby'>;

function LobbyScreen({ route }: Props) {
    const { joinKey } = route.params;

    return (
        <LobbyProvider joinKey={joinKey}>
            <Lobby joinKey={joinKey} />
        </LobbyProvider>
    );
}

export default LobbyScreen;
