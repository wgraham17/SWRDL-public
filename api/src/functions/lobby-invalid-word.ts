import assert from 'assert';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import { Lobby, Round } from '../models';

const getActiveRound = (lobby: Lobby) => lobby.rounds.find(r => r.active);
const getParticipant = (round: Round, userId: ObjectId) => round.participants.find(p => p.user.equals(userId));

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};
    const { guess } = JSON.parse(event.body || '{}');

    try {
        assert(typeof joinKey === 'string');
        assert(typeof guess === 'string');
    } catch {
        return { statusCode: 400 };
    }

    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    console.debug('lobby=', lobby, 'deleted=', lobby?.deleted, 'hasGameEnded=', lobby?.hasGameEnded);
    if (!lobby || lobby.deleted || lobby.hasGameEnded) return { statusCode: 404 };

    const activeRound = getActiveRound(lobby);
    console.debug('activeRound=', activeRound);
    if (!activeRound) return { statusCode: 404 };

    const userId = ObjectId.createFromHexString(event.requestContext.authorizer.lambda.userId);
    const participant = getParticipant(activeRound, userId);

    console.debug('participant=', participant);
    if (!participant) return { statusCode: 404 };
    if (participant.isDone) return { statusCode: 409 };

    await db.lobbyAddInvalidWord(lobby.joinKey, activeRound.sequence, userId, guess);

    return { statusCode: 204 };
};
