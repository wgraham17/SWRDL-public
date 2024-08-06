import { useTheme } from '@ui-kitten/components';
import { useMemo } from 'react';
import { RefreshControl, RefreshControlProps, useColorScheme } from 'react-native';

export default function ThemedRefreshControl(props: RefreshControlProps) {
    const colorScheme = useColorScheme();
    const primaryColorLight = useTheme()['color-primary-500'];
    const primaryColorDark = useTheme()['color-primary-100'];
    const tintColor = useMemo(
        () => (colorScheme === 'light' ? primaryColorLight : primaryColorDark),
        [colorScheme, primaryColorLight, primaryColorDark],
    );
    const backgroundColor = useTheme()['background-basic-color-2'];

    return (
        <RefreshControl
            tintColor={tintColor}
            colors={[tintColor]}
            progressBackgroundColor={backgroundColor}
            {...props}
        />
    );
}

ThemedRefreshControl.defaultProps = {
    onRefresh: undefined,
};
