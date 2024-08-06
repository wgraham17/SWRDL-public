import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import getDB from '../data';
import { publishLobbyToUser, publishNoLobbies } from '../util';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    const userId = ObjectId.createFromHexString(event.requestContext.authorizer.lambda.userId);
    const db = await getDB();
    const lobbies = (await db.userGetLobbies(userId)).filter(l => !!l.endDate);

    if (lobbies.length > 0) {
        await Promise.all(lobbies.map(lobby => publishLobbyToUser(userId, lobby.joinKey)));
    } else {
        await publishNoLobbies(userId);
    }

    return { statusCode: 204 };
};
