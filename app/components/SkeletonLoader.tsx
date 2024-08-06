import { useStyleSheet } from '@ui-kitten/components';
import { memo, useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import SkeletonLoaderStyles from './SkeletonLoader.styles';

interface Props {
    style: ViewStyle | ViewStyle[];
}

function SkeletonLoader({ style }: Props) {
    const styles = useStyleSheet(SkeletonLoaderStyles);
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
    }, [progress]);

    const skeletonStyle = useAnimatedStyle(() => ({
        opacity: progress.value * 0.5 + 0.25,
    }));

    return <Animated.View style={[styles.skeleton, style, skeletonStyle]} />;
}

export default memo(SkeletonLoader);
