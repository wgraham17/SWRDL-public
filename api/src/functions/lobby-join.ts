import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import { publishLobbyToAllUsers } from '../util';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};

    if (!joinKey) return { statusCode: 400 };

    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby || lobby.deleted || lobby.hasGameEnded) return { statusCode: 404 };
    if (lobby.users.length >= 8) return { statusCode: 507 };

    if (lobby.gameMode === 'custom') {
        const { maxPlayers } = lobby.gameRules;
        if (lobby.users.length >= maxPlayers) return { statusCode: 507 };
    }

    const userId = ObjectId.createFromHexString(event.requestContext.authorizer.lambda.userId);
    await db.lobbyUserJoin(joinKey, userId);
    await publishLobbyToAllUsers(lobby.joinKey);

    return {
        statusCode: 204,
    };
};
