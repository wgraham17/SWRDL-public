import Logo from '@components/logo';
import { Button, Icon, IconProps, Layout, Text } from '@ui-kitten/components';
import { useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { UnauthedStackParamList } from './UnauthedStackParamList';

function GoIcon(props: IconProps) {
    return <Icon {...props} name="arrow-forward" />;
}

type Props = NativeStackScreenProps<UnauthedStackParamList>;

function WelcomeScreen({ navigation }: Props) {
    const handleCreate = useCallback(() => navigation.push('CreateAccount'), [navigation]);
    const handleRecover = useCallback(() => navigation.push('Recover'), [navigation]);

    return (
        <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Layout style={{ padding: 32, alignItems: 'stretch', justifyContent: 'center' }}>
                <Logo style={{ alignSelf: 'center', width: 120, height: 120, margin: 16 }} />
                <View style={{ margin: 16 }}>
                    <Text category="h4">Welcome to SWRDL,</Text>
                    <Text category="h4">the social word game!</Text>
                </View>
                <Text style={{ margin: 16 }}>
                    Create a group and compete with your friends and family as you all guess the same word.{' '}
                </Text>
                <Text style={{ margin: 16 }}>Earn points for each round and see who can claim the title of...</Text>
                <Text category="h6" style={{ margin: 16 }}>
                    Champion of the SWRDL!
                </Text>
                <Button style={{ marginVertical: 32 }} accessoryRight={GoIcon} onPress={handleCreate}>
                    Let&apos;s play
                </Button>
                <Button appearance="ghost" accessoryRight={GoIcon} onPress={handleRecover}>
                    Recover my account
                </Button>
            </Layout>
        </Layout>
    );
}

export default WelcomeScreen;
