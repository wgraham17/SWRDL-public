import { memo, useMemo } from 'react';
import Toast from 'react-native-toast-message';
import ThemedToast from './ThemedToast';

function ThemedToaster() {
    const toastConfig = useMemo(
        () => ({
            success: ThemedToast,
            error: ThemedToast,
            'user-avatar': ThemedToast,
        }),
        [],
    );
    return <Toast config={toastConfig} />;
}

export default memo(ThemedToaster);
