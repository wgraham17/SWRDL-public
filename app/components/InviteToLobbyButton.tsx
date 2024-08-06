import { useLobby } from '@hooks/useLobby';
import { Button } from '@ui-kitten/components';

function InviteToLobbyButton() {
    const { shareInvite } = useLobby();

    return (
        <Button appearance="ghost" onPress={shareInvite}>
            Invite Someone to Join
        </Button>
    );
}

export default InviteToLobbyButton;
