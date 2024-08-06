import { SNSEvent } from 'aws-lambda';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { ObjectId, WithId } from 'mongodb';
import getDB from '../data';
import { GameMode } from '../game-logic';
import { Lobby, Notification, Round, User } from '../models';
import { getRoundStatusMessage } from '../util';

const expoClient = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export interface LobbyRoundPushNotificationMessage {
    joinKey: string;
    roundSequence: number;
}

export const GameModeDisplayNames: Record<GameMode, string> = {
    classic: 'Daily Classic',
    'classic-continuous': 'Continuous Classic',
    custom: 'Custom',
};

const isLobbyReadyForUser = (userId: ObjectId, lobby: Lobby) => {
    const activeRound = lobby.rounds.find(r => r.active);
    const participant = activeRound?.participants.find(p => p.user.equals(userId));
    return lobby.hasGameStarted && !lobby.hasGameEnded && activeRound && participant && !participant.isDone;
};

const getRoundNeedsWordMessage = async (
    lobby: Lobby,
    round: Round,
    user: WithId<User>,
): Promise<ExpoPushMessage | undefined> => {
    if (!user.notifications || !user.notifications.enabled || !user.notifications.token) {
        return undefined;
    }

    const db = await getDB();
    const lobbies = await db.userGetLobbies(user._id);
    const badge = lobbies.filter(l => isLobbyReadyForUser(user._id, l)).length;
    const gameName = lobby.gameMode === 'custom' ? lobby.name : GameModeDisplayNames[lobby.gameMode];

    return {
        to: user.notifications.token,
        data: {
            joinKey: lobby.joinKey,
            roundSequence: round.sequence,
        },
        sound: 'default',
        title: 'Word Needed',
        body: `Round #${round.sequence} in your ${gameName} game needs you to pick a word.`,
        expiration: Math.round(round.expectedEndDate.getTime() / 1000),
        badge,
    };
};

const getRoundReadyForWordMessage = async (
    lobby: Lobby,
    round: Round,
    user: WithId<User>,
): Promise<ExpoPushMessage | undefined> => {
    if (!user.notifications || !user.notifications.enabled || !user.notifications.token) {
        return undefined;
    }

    const db = await getDB();
    const lobbies = await db.userGetLobbies(user._id);
    const badge = lobbies.filter(l => isLobbyReadyForUser(user._id, l)).length;
    const gameName = lobby.gameMode === 'custom' ? lobby.name : GameModeDisplayNames[lobby.gameMode];

    return {
        to: user.notifications.token,
        data: {
            joinKey: lobby.joinKey,
            roundSequence: round.sequence,
        },
        sound: 'default',
        title: 'Ready to Play',
        body: `Word #${round.sequence} in your ${gameName} game is ready for play!`,
        expiration: Math.round(round.expectedEndDate.getTime() / 1000),
        badge,
    };
};

export const handler = async (event: SNSEvent) => {
    const db = await getDB();
    const notificationsToPush: ExpoPushMessage[] = [];

    for (const record of event.Records) {
        const { joinKey, roundSequence } = JSON.parse(record.Sns.Message) as LobbyRoundPushNotificationMessage;
        const lobby = await db.lobbyGetByJoinKey(joinKey);
        const round = lobby?.rounds.find(r => r.sequence === roundSequence);

        if (!lobby || !round) return;

        for (const participant of round.participants) {
            const user = await db.userGet(participant.user);

            console.debug(
                'Checking for participant push notification, participant=',
                participant,
                'user=',
                user,
                'notifications.enabled=',
                !!user?.notifications?.enabled,
                'notifications.token=',
                !!user?.notifications?.token,
            );
            if (!user || !user.notifications?.enabled || !user.notifications.token) continue;

            let pushMessage: ExpoPushMessage | undefined;
            const userRoundStatus = getRoundStatusMessage(lobby, round, participant);

            console.debug('userRoundStatus=', userRoundStatus, 'hasBeenNotified=', participant.hasBeenNotified);

            if (userRoundStatus === 'ROUND_SETUP_SELF' && !participant.hasBeenNotified) {
                pushMessage = await getRoundNeedsWordMessage(lobby, round, user);
                console.debug('Pushing notification for round setup', pushMessage);

                await db.lobbySetParticipantNotified(lobby.joinKey, round.sequence, participant.user);
            } else if (userRoundStatus === 'ROUND_ACTIVE') {
                pushMessage = await getRoundReadyForWordMessage(lobby, round, user);
                console.debug('Pushing notification for round ready to play', pushMessage);
            }

            if (pushMessage) {
                notificationsToPush.push(pushMessage);
            }
        }
    }

    if (notificationsToPush.length > 0) {
        const chunks = expoClient.chunkPushNotifications(notificationsToPush);

        for (const chunk of chunks) {
            const chunkTickets = await expoClient.sendPushNotificationsAsync(chunk);
            const pendingNotifications: Notification[] = [];

            for (let index = 0; index < chunk.length; index++) {
                const notification = chunk[index];
                const ticket = chunkTickets[index];
                const user = await db.userGetByNotificationToken(notification.to as string);

                if (!user) throw new Error('didnt find user after sending notification, should not be possible');

                if (ticket.status === 'error') {
                    console.error(
                        'Error while sending push notification ',
                        ticket.message,
                        ticket.details,
                        notification,
                    );
                    await db.userSavePreferences(user._id, { enabled: false, token: undefined });
                } else {
                    pendingNotifications.push({
                        userId: user._id,
                        ticket: ticket.id,
                        sendDate: new Date(),
                        deliveryStatus: 'pending',
                    });
                }
            }

            if (pendingNotifications.length > 0) {
                await db.notificationSaveMany(pendingNotifications);
            }
        }
    }
};
