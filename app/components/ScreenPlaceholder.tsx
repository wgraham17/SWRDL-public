import {
    Divider,
    Icon,
    IconProps,
    Spinner,
    Text,
    TextProps,
    TopNavigation,
    TopNavigationAction,
} from '@ui-kitten/components';
import { useCallback } from 'react';
import { View } from 'react-native';
import Logo from './logo';
import ThemedSafeArea from './ThemedSafeArea';

function BackIcon(props: IconProps) {
    return <Icon {...props} name="arrow-back" />;
}

interface Props {
    onBack?: (() => void) | undefined;
}

function ScreenPlaceholder({ onBack }: Props) {
    const renderMenuAction = useCallback(
        (handleBack: (() => void) | undefined) => (
            <TopNavigationAction accessibilityLabel="Go Back" icon={BackIcon} onPress={handleBack} />
        ),
        [],
    );
    const renderTitle = (props: TextProps | undefined) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Logo width={28} height={32} style={{ marginHorizontal: 8 }} />
            <View>
                <Text {...props}>SWRDL - the Social Word game!</Text>
            </View>
        </View>
    );

    return (
        <ThemedSafeArea>
            <TopNavigation title={renderTitle} accessoryLeft={onBack ? renderMenuAction(onBack) : undefined} />
            <Divider />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Spinner size="giant" />
            </View>
        </ThemedSafeArea>
    );
}

ScreenPlaceholder.defaultProps = {
    onBack: undefined,
};

export default ScreenPlaceholder;
