import { FormatMsToReadable } from '@root/util';
import { Icon, Text, useStyleSheet } from '@ui-kitten/components';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import RoundStatsTimeStyles from './RoundStatsTime.styles';

interface Props {
    title: string;
    value: number;
    icon: string;
}

function RoundStatsTime({ title, value, icon }: Props) {
    const styles = useStyleSheet(RoundStatsTimeStyles);
    const timeFormatted = useMemo(() => FormatMsToReadable(value), [value]);

    return (
        <View style={styles.container}>
            <Icon name={icon} style={styles.icon} />
            <Text category="label" appearance="hint" style={styles.title}>
                {title}
            </Text>
            <Text style={styles.value} category="s1">
                {timeFormatted}
            </Text>
        </View>
    );
}

export default memo(RoundStatsTime);
