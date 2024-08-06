import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import { publishLobbyRemove, publishLobbyToAllUsers } from '../util';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};

    if (!joinKey) return { statusCode: 400 };

    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby || lobby.deleted || lobby.hasGameEnded) return { statusCode: 404 };

    const userId = ObjectId.createFromHexString(event.requestContext.authorizer.lambda.userId);
    await db.lobbyUserLeave(joinKey, userId);

    if (
        lobby.gameMode === 'custom' &&
        lobby.gameRules.minPlayers &&
        lobby.users.length - 1 < lobby.gameRules.minPlayers
    ) {
        console.debug('Game below minimum number of players, minPlayers=', lobby.gameRules.minPlayers);
        await db.lobbyEndGame(joinKey, 'dropped-below-min-players');
    }

    await publishLobbyToAllUsers(lobby.joinKey);
    await publishLobbyRemove(userId, lobby.joinKey);

    return {
        statusCode: 204,
    };
};
