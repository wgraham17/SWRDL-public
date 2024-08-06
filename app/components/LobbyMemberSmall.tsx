import { useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import { View } from 'react-native';
import LobbyMemberSmallStyles from './LobbyMemberSmall.styles';
import UserAvatar from './UserAvatar';

interface Props {
    userId: string;
}

function LobbyMemberSmall({ userId }: Props) {
    const styles = useStyleSheet(LobbyMemberSmallStyles);

    return (
        <View style={styles.container}>
            <UserAvatar style={styles.avatar} userId={userId} />
        </View>
    );
}

export default memo(LobbyMemberSmall);
