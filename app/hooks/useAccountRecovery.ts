import { UserCredentials } from '@root/models';
import * as Sentry from '@sentry/react-native';
import { useCallback, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { useGlobal } from 'reactn';
import useAxios from './useAxios';

export default function useAccountRecovery() {
    const unauthedAxios = useAxios(false);
    const authedAxios = useAxios();
    const [recoveryEnabled, setRecoveryEnabled] = useGlobal('recoveryEnabled');
    const isSendingCompleteRequest = useRef(false);
    const isSendingSetupCompleteRequest = useRef(false);

    const startRecoverySetup = useCallback(
        async (emailAddress: string) => {
            if (!authedAxios) return false;

            try {
                await authedAxios.post('/users/_self/recovery/setup', { emailAddress });
                return true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (err.isAxiosError) {
                    if (err.response?.status === 409) {
                        if (err.response.data === 'email_in_use') {
                            Toast.show({
                                type: 'error',
                                text1: 'Setup Failed',
                                text2: 'It looks like that email address is already used for another SWRDL account.',
                            });
                            return false;
                        }

                        if (err.response.data === 'recovery_already_setup') {
                            Toast.show({
                                type: 'error',
                                text1: 'Setup Failed',
                                text2: 'Account Recovery is already set up for this account.',
                            });
                            return false;
                        }
                    }
                }

                Sentry.captureException(err);
                Toast.show({
                    type: 'error',
                    text1: 'Setup Failed',
                    text2: 'We had a problem setting up recovery for your account. Please try again.',
                });
                return false;
            }
        },
        [authedAxios],
    );

    const completeRecoverySetup = useCallback(
        async (token: string) => {
            if (!authedAxios || isSendingSetupCompleteRequest.current) return '';

            isSendingSetupCompleteRequest.current = true;

            try {
                await authedAxios.put('/users/_self/recovery/setup', { setupToken: token });
                setRecoveryEnabled(true);

                return 'success';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (err.isAxiosError) {
                    if (err.response?.status === 403) {
                        return 'link-expired';
                    }

                    if (err.response?.status === 409) {
                        return 'already-set-up';
                    }
                }

                Sentry.captureException(err);
                return 'error';
            } finally {
                isSendingSetupCompleteRequest.current = false;
            }
        },
        [authedAxios, setRecoveryEnabled],
    );

    const startRecovery = useCallback(
        async (emailAddress: string) => {
            if (!unauthedAxios) return false;

            try {
                await unauthedAxios.post('/users/_self/recovery', { emailAddress });
                return true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (err.isAxiosError) {
                    if (err.response?.status === 404) {
                        Toast.show({
                            type: 'error',
                            text1: 'Recovery Failed',
                            text2: "That email address doesn't match any account.",
                        });
                        return false;
                    }
                }

                Sentry.captureException(err);
                Toast.show({
                    type: 'error',
                    text1: 'Recovery Failed',
                    text2: 'We had a problem recovering your account. Please try again.',
                });
                return false;
            }
        },
        [unauthedAxios],
    );

    const completeRecovery = useCallback(
        async (token: string, shouldReset: boolean) => {
            if (!unauthedAxios || isSendingCompleteRequest.current) return 'error';

            isSendingCompleteRequest.current = true;

            try {
                const result = await unauthedAxios.put<UserCredentials>('/users/_self/recovery', {
                    recoveryToken: token,
                    shouldResetToken: shouldReset,
                });

                return result.data;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                isSendingCompleteRequest.current = false;

                if (err.isAxiosError && err.response?.status === 403) {
                    return 'link-expired';
                }

                Sentry.captureException(err);
                return 'error';
            } finally {
                isSendingCompleteRequest.current = false;
            }
        },
        [unauthedAxios],
    );

    return { recoveryEnabled, startRecoverySetup, completeRecoverySetup, startRecovery, completeRecovery };
}
