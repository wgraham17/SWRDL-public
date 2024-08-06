import { useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UnauthedStackParamList } from '@screens/UnauthedStackParamList';
import Toast from 'react-native-toast-message';
import { Spinner, useStyleSheet } from '@ui-kitten/components';
import * as Sentry from '@sentry/react-native';
import ThemedSafeArea from '@components/ThemedSafeArea';
import useAppUser from '@hooks/useAppUser';
import CreateAccountScreenStyles from './CreateAccountScreen.styles';

type Props = NativeStackScreenProps<UnauthedStackParamList, 'CreateAccount'>;

function CreateAccountScreen({ navigation }: Props) {
    const styles = useStyleSheet(CreateAccountScreenStyles);
    const { registerUser } = useAppUser();

    useEffect(() => {
        if (navigation) {
            const createAccount = async () => {
                try {
                    await registerUser();
                } catch (err) {
                    Sentry.captureException(err);
                    Toast.show({
                        type: 'error',
                        text1: 'We ran into a problem',
                        text2: "We couldn't create an account for you right now. Please try again.",
                    });
                    navigation.pop();
                }
            };

            createAccount();
        }
    }, [navigation, registerUser]);

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Spinner size="giant" />
            </View>
        </ThemedSafeArea>
    );
}

export default CreateAccountScreen;
