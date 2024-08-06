import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { GameModeLookup } from '../game-logic';
import { publishLobbyToAllUsers } from '../util';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};

    if (!joinKey) return { statusCode: 400 };

    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby || lobby.deleted || lobby.hasGameEnded) return { statusCode: 404 };

    if (!lobby.owner.equals(event.requestContext.authorizer.lambda.userId)) {
        return { statusCode: 403 };
    }

    const didStart = await db.lobbyStart(joinKey);

    if (!didStart) return { statusCode: 208 };

    const gameLogic = GameModeLookup[lobby.gameMode];
    const nextRound = gameLogic.createRound(lobby);
    await db.lobbyAddRound(lobby.joinKey, nextRound);
    await publishLobbyToAllUsers(lobby.joinKey);

    return {
        statusCode: 204,
    };
};
