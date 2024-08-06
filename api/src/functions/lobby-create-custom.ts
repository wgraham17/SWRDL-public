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
    gameRules: {
        wordSource: 'dictionary' | 'one-player' | 'pvp';
        interval: 'continuous' | 'daily';
        minPlayers: number;
        maxPlayers: number;
        guessLimit: number | undefined;
        maskResult: 'position' | 'existence';
        strict: boolean;
    };
    name: string;
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
        assert(request?.gameMode === 'custom');
        assert(typeof request.name === 'string');
        assert(request.tz);
        assert(isValidTimezoneIANAString(request.tz));
        assert(typeof request.gameRules === 'object');
        assert(typeof request.gameRules.wordSource === 'string');
        assert(['dictionary', 'one-player', 'pvp'].includes(request.gameRules.wordSource));
        assert(['continuous', 'daily'].includes(request.gameRules.interval));
        assert(typeof request.gameRules.minPlayers === 'number');
        assert(request.gameRules.minPlayers >= 1);
        assert(typeof request.gameRules.maxPlayers === 'number');
        assert(request.gameRules.maxPlayers <= 8);
        assert(request.gameRules.maxPlayers >= request.gameRules.minPlayers);
        assert(['undefined', 'number'].includes(typeof request.gameRules.guessLimit));
        assert(['position', 'existence'].includes(request.gameRules.maskResult));
        assert(typeof request.gameRules.strict === 'boolean');
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
        gameRules: request.gameRules,
        name: request.name,
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
