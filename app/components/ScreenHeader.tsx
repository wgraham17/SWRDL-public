import useAppUser from '@hooks/useAppUser';
import { useRealtime, WebSocketState } from '@hooks/useRealtime';
import useUserName from '@hooks/useUserName';
import { Text, TextProps, TopNavigation, useStyleSheet } from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import LobbyAvatar from './LobbyAvatar';
import ScreenHeaderStyles from './ScreenHeader.styles';
import SkeletonLoader from './SkeletonLoader';
import UserAvatar from './UserAvatar';

const RealtimeStatusDisplay: Record<WebSocketState, string> = {
    open: '',
    closed: '(offline)',
    opening: '(connecting)',
    reconnect: '(waiting to connect)',
};

interface Props {
    accessoryLeft?: RenderProp | undefined;
    accessoryRight?: RenderProp | undefined;
    title: string;
    joinKey?: string | undefined;
    userId?: string | undefined;
}

function ScreenHeader({ accessoryLeft, accessoryRight, title, joinKey, userId }: Props) {
    const styles = useStyleSheet(ScreenHeaderStyles);
    const { appUser } = useAppUser();
    const { state } = useRealtime();
    const indicatorStyle = useMemo(() => {
        if (state === 'closed') return styles.indicatorClosed;
        if (state === 'open') return styles.indicatorOpen;

        return styles.indicatorConnecting;
    }, [state, styles]);
    const userName = useUserName(userId);

    let subtitle = userName.isLoaded ? userName.name : appUser?.name;
    if (subtitle && !userId) {
        subtitle += ` ${RealtimeStatusDisplay[state]}`;
    }

    const renderTitle = (props: TextProps | undefined) => (
        <View style={styles.root}>
            {!joinKey && <UserAvatar userId={appUser?.id} style={styles.avatar} />}
            {joinKey && !userId && <LobbyAvatar joinKey={joinKey} style={styles.avatar} />}
            {joinKey && userId && <UserAvatar userId={userId} style={styles.avatar} />}
            <View>
                <Text {...props}>{title}</Text>
                <View style={styles.line2}>
                    {!userId && <View style={[styles.indicator, indicatorStyle]} />}
                    {!subtitle && <SkeletonLoader style={styles.skeleton} />}
                    {subtitle && <Text category="c1">{subtitle}</Text>}
                </View>
            </View>
        </View>
    );

    return <TopNavigation title={renderTitle} accessoryLeft={accessoryLeft} accessoryRight={accessoryRight} />;
}

ScreenHeader.defaultProps = {
    accessoryLeft: undefined,
    accessoryRight: undefined,
    joinKey: undefined,
    userId: undefined,
};

export default memo(ScreenHeader);
