import useUserAvatar from '@hooks/useUserAvatar';
import { useStyleSheet } from '@ui-kitten/components';
import { View, ViewStyle } from 'react-native';
import UserAvatarStyles from './UserAvatar.styles';

interface Props {
    userId?: string | undefined;
    style?: ViewStyle | undefined;
}

function UserAvatar({ userId, style }: Props) {
    const avatar = useUserAvatar(userId);
    const styles = useStyleSheet(UserAvatarStyles);

    if (!avatar.isLoaded) {
        return <View style={[styles.avatar, styles.avatarPlaceholder, style]} />;
    }

    return (
        <View style={[styles.avatar, style]}>
            <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: avatar.xml }}
                style={{ width: style?.width || '100%', height: style?.height || '100%' }}
            />
        </View>
    );
}

UserAvatar.defaultProps = {
    userId: undefined,
    style: {},
};

export default UserAvatar;
