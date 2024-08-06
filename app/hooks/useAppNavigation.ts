import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';

export default function useAppNavigation() {
    return useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
}
