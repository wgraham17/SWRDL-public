import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { randomInt } from 'crypto';
import assert from 'assert';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import { GameMode } from '../game-logic';
import { publishLobbyToUser } from '../util';

interface RequestModel {
    gameMode: GameMode;
    tz: string;
}

const isValidTimezoneIANAString = (timeZoneString: string) => {
    try {
        new Intl.DateTimeFormat(undefined, { timeZone: timeZoneString });
        return true;
    } catch (error) {
        return false;
    }
};

const findAvailableJoinKey = async () => {
    const db = await getDB();
    let joinKey = randomInt(1000000, 9999999).toString();

    while (true) {
        const available = !(await db.lobbyGetByJoinKey(joinKey));

        if (available) {
            break;
        }

        joinKey = randomInt(1000000, 9999999).toString();
    }

    return joinKey;
};

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    let request: RequestModel;

    try {
        request = JSON.parse(event.body || '');
        assert(request?.gameMode === 'classic' || request?.gameMode === 'classic-continuous');
        assert(request.tz);
        assert(isValidTimezoneIANAString(request.tz));
    } catch {
        return { statusCode: 400 };
    }

    const userId = ObjectId.createFromHexString(event.requestContext.authorizer.lambda.userId);
    const joinKey = await findAvailableJoinKey();
    const db = await getDB();

    await db.lobbyCreate({
        joinKey,
        gameMode: request.gameMode,
        tz: request.tz,
        owner: userId,
        users: [userId],
        rounds: [],
        hasGameStarted: false,
        hasGameEnded: false,
        deleted: false,
        createDate: new Date(),
    });
    await publishLobbyToUser(userId, joinKey);

    return {
        statusCode: 200,
        body: JSON.stringify({ joinKey }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
};
