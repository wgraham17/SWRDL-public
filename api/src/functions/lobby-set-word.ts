import assert from 'assert';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import { Lobby, Round } from '../models';
import { publishLobbyToAllUsers } from '../util';

const sns = new SNS({
    region: process.env.AWS_REGION,
});

const getActiveRound = (lobby: Lobby) => lobby.rounds.find(r => r.active);
const getParticipant = (round: Round, userId: ObjectId) => round.participants.find(p => p.user.equals(userId));

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};
    const { word } = JSON.parse(event.body || '{}');

    try {
        assert(typeof joinKey === 'string');
        assert(typeof word === 'string');
    } catch {
        return { statusCode: 400 };
    }

    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    console.debug('lobby=', lobby, 'deleted=', lobby?.deleted, 'hasGameEnded=', lobby?.hasGameEnded);
    if (
        !lobby ||
        lobby.deleted ||
        lobby.hasGameEnded ||
        lobby.gameMode !== 'custom' ||
        lobby.gameRules.wordSource === 'dictionary'
    ) {
        return { statusCode: 404 };
    }

    const activeRound = getActiveRound(lobby);
    console.debug('activeRound=', activeRound);
    if (!activeRound) return { statusCode: 404 };

    const userId = ObjectId.createFromHexString(event.requestContext.authorizer.lambda.userId);
    const participant = getParticipant(activeRound, userId);

    console.debug('participant=', participant);
    if (!participant) return { statusCode: 404 };
    if (!participant.shouldProvideWord) return { statusCode: 403 };

    if (lobby.gameRules.wordSource === 'pvp') {
        if (!!participant.word) return { statusCode: 409 };
        await db.lobbySetParticipantWord(lobby.joinKey, activeRound.sequence, participant.user, word);

        const otherParticipant = activeRound.participants.filter(p => !p.user.equals(participant.user));
        if (otherParticipant.length !== 1) throw new Error('No other participant?!');
    } else {
        if (!!activeRound.word) return { statusCode: 409 };
        await db.lobbySetRoundWord(lobby.joinKey, activeRound.sequence, userId, word);
    }

    await publishLobbyToAllUsers(lobby.joinKey);

    await sns
        .publish({
            Message: JSON.stringify({ joinKey: lobby.joinKey, roundSequence: activeRound.sequence }),
            TopicArn: process.env.PUSH_NOTIFICATIONS_TOPIC_ARN,
        })
        .promise();

    return { statusCode: 204 };
};
