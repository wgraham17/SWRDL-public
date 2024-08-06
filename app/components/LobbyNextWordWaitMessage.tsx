import { Card, Icon, Text, useStyleSheet } from '@ui-kitten/components';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { memo, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import LobbyNextWordWaitMessageStyles from './LobbyNextWordWaitMessage.styles';

interface HeaderProps {
    title: string;
}

function Header({ title }: HeaderProps) {
    const styles = useStyleSheet(LobbyNextWordWaitMessageStyles);
    return (
        <View style={styles.headerContainer}>
            <Icon name="clock" style={styles.headerIcon} />
            <Text category="label">{title}</Text>
        </View>
    );
}

interface Props {
    expectedEndDate: string;
    nextSequence: number;
}

function LobbyNextWordWaitMessage({ expectedEndDate, nextSequence }: Props) {
    const styles = useStyleSheet(LobbyNextWordWaitMessageStyles);
    const [endsIn, setEndsIn] = useState('');

    useEffect(() => {
        const setLabel = () =>
            setEndsIn(
                formatDistanceToNow(parseISO(expectedEndDate), {
                    includeSeconds: true,
                    addSuffix: true,
                }),
            );

        const updateEndDate = setInterval(() => {
            if (parseISO(expectedEndDate) < new Date()) {
                setEndsIn('momentarily');
                clearInterval(updateEndDate);
            } else {
                setLabel();
            }
        }, 1000);

        setLabel();
        return () => clearInterval(updateEndDate);
    }, [expectedEndDate]);

    const headerTitle = useMemo(() => `Round ${nextSequence}`, [nextSequence]);

    return (
        <Card disabled header={<Header title={headerTitle} />} style={styles.container}>
            <Text category="p1">Next word available {endsIn}.</Text>
        </Card>
    );
}

export default memo(LobbyNextWordWaitMessage);
