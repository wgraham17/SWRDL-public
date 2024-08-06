import { Icon, Layout, Text, useStyleSheet } from '@ui-kitten/components';
import { EvaStatus } from '@ui-kitten/components/devsupport';
import { View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import ThemedToastStyles from './ThemedToast.styles';
import UserAvatar from './UserAvatar';

interface Props {
    text1?: string | undefined;
    text2?: string | undefined;
    onPress: () => void;
    type: string;
    props?: { userAvatarId: string } | undefined;
}

const TypeMap: Record<string, EvaStatus> = {
    success: 'success',
    error: 'error',
    'user-avatar': 'info',
};

function ThemedToast({ text1, text2, onPress, type, props }: Props) {
    const styles = useStyleSheet(ThemedToastStyles);
    if (!TypeMap[type]) {
        throw new Error('Unrecognized type');
    }

    return (
        <TouchableWithoutFeedback onPress={onPress} style={styles.root}>
            <Layout level="4" style={styles.container}>
                <View style={styles.header}>
                    {type === 'success' && <Icon name="checkmark-circle" style={styles.successIcon} />}
                    {type === 'error' && <Icon name="alert-circle" style={styles.errorIcon} />}
                    {type === 'user-avatar' && props?.userAvatarId && (
                        <UserAvatar userId={props.userAvatarId} style={styles.avatarIcon} />
                    )}
                    <Text category="label">{text1}</Text>
                </View>
                {!!text2 && (
                    <Text category="p2" style={styles.text2}>
                        {text2}
                    </Text>
                )}
            </Layout>
        </TouchableWithoutFeedback>
    );
}

ThemedToast.defaultProps = {
    text1: undefined,
    text2: undefined,
    props: undefined,
};

export default ThemedToast;
