import UnauthedStack from '@screens/UnauthedStack';
import useAppUser from '@hooks/useAppUser';
import { Spinner, useStyleSheet } from '@ui-kitten/components';
import { View } from 'react-native';
import AuthedStack from './screens/AuthedStack';
import AppRootContainerStyles from './AppRootContainer.styles';

function AppRootContainer() {
    const styles = useStyleSheet(AppRootContainerStyles);
    const { appUser, isRestoringUser } = useAppUser();

    if (isRestoringUser)
        return (
            <View style={styles.container}>
                <Spinner size="giant" />
            </View>
        );

    return appUser ? <AuthedStack /> : <UnauthedStack />;
}

export default AppRootContainer;
