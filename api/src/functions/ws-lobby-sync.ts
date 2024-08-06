import { SNSEvent } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import getDB from '../data';
import { publishLobbyToUser, publishNoLobbies } from '../util';

export const handler = async (event: SNSEvent) => {
    const db = await getDB();

    for (const record of event.Records) {
        const userId = record.Sns.Message;
        const lobbies = await db.userGetLobbies(userId);

        if (lobbies.length > 0) {
            console.log('syncing', lobbies.length, 'lobbies to userId=', userId);
            await Promise.all(
                lobbies.map(lobby => publishLobbyToUser(ObjectId.createFromHexString(userId), lobby.joinKey)),
            );
        } else {
            await publishNoLobbies(ObjectId.createFromHexString(userId));
        }
    }
};
