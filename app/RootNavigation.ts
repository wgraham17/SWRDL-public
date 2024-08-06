import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params: object | undefined) {
    if (navigationRef.isReady()) {
        try {
            navigationRef.dispatch(StackActions.popToTop());
        } catch {
            // Do nothing
        }

        navigationRef.dispatch(StackActions.push(name, params));
    }
}
