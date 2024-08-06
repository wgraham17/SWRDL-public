import useLobbyAvatar from '@hooks/useLobbyAvatar';
import { useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import LobbyAvatarStyles from './LobbyAvatar.styles';
import SkeletonLoader from './SkeletonLoader';

interface Props {
    joinKey?: string | undefined;
    style?: ViewStyle | undefined;
}

function LobbyAvatar({ joinKey, style }: Props) {
    const avatar = useLobbyAvatar(joinKey);
    const styles = useStyleSheet(LobbyAvatarStyles);

    if (!avatar.isLoaded) {
        return <SkeletonLoader style={[style || { width: '100%', height: '100%' }, styles.avatarPlaceholder]} />;
    }

    return (
        <View style={[styles.avatar, style]}>
            <SvgXml xml={avatar.xml} width={style?.width || '100%'} height={style?.height || '100%'} />
        </View>
    );
}

LobbyAvatar.defaultProps = {
    joinKey: undefined,
    style: {},
};

export default memo(LobbyAvatar);
