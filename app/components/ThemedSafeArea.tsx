import { useStyleSheet } from '@ui-kitten/components';
import { memo } from 'react';
import { NativeSafeAreaViewProps, SafeAreaView } from 'react-native-safe-area-context';
import ThemedSafeAreaStyles from './ThemedSafeArea.styles';

function ThemedSafeArea(props: NativeSafeAreaViewProps) {
    const styles = useStyleSheet(ThemedSafeAreaStyles);
    return <SafeAreaView style={styles.container} {...props} />;
}

export default memo(ThemedSafeArea);
