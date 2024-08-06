import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { publishLobbyRemoveToAllUsers, publishLobbyToAllUsers } from '../util';

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};

    if (!joinKey) {
        return { statusCode: 400 };
    }

    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby || lobby.deleted || lobby.hasGameEnded) {
        return { statusCode: 404 };
    }

    if (!lobby.owner.equals(event.requestContext.authorizer.lambda.userId)) {
        return { statusCode: 403 };
    }

    await db.lobbyEndGame(joinKey, 'host-initiated');
    await publishLobbyToAllUsers(lobby.joinKey);
    await publishLobbyRemoveToAllUsers(lobby.joinKey);

    return {
        statusCode: 204,
    };
};
