import { Expo } from 'expo-server-sdk';
import getDB from '../data';

const expoClient = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export const handler = async (): Promise<void> => {
    const db = await getDB();

    console.debug('Getting a list of pending notifications...');
    const pending = await db.notificationGetPending();
    const chunks = expoClient.chunkPushNotificationReceiptIds(pending.map(p => p.ticket));

    for (const chunk of chunks) {
        const receipts = await expoClient.getPushNotificationReceiptsAsync(chunk);

        for (const ticket of chunk) {
            const receipt = receipts[ticket];

            if (receipt.status === 'ok') {
                await db.notificationUpdateStatus(ticket, 'success', receipt);
            } else {
                await db.notificationUpdateStatus(ticket, 'error', receipt);
                console.error('Error while sending push notification ', receipt.message, receipt.details);

                const notification = pending.find(n => n.ticket === ticket);
                if (!notification) continue;

                await db.userSavePreferences(notification.userId, { enabled: false, prompted: true, token: undefined });
            }
        }
    }
};
