import assert from 'assert';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import { Lobby, Round } from '../models';
import { GameModeLookup } from '../game-logic';
import { checkLobbyForRoundAdvancement } from './lobby-round-advancement';
import { publishLobbyToAllUsers, publishParticipantDone } from '../util';

const getActiveRound = (lobby: Lobby) => lobby.rounds.find(r => r.active);
const getParticipant = (round: Round, userId: ObjectId) => round.participants.find(p => p.user.equals(userId));

const attemptRoundAdvancement = async (joinKey: string) => {
    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby) return;

    await checkLobbyForRoundAdvancement(lobby);
};

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    console.debug(JSON.stringify(event));
    const { joinKey } = event.pathParameters || {};
    const { guess, guessKey, timeSpent } = JSON.parse(event.body || '{}');

    try {
        assert(typeof joinKey === 'string');
        assert(typeof guess === 'string');
        assert(typeof timeSpent === 'number');
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
    const user = await db.userGet(userId);
    const participant = getParticipant(activeRound, userId);
    const otherParticipants = activeRound.participants.filter(p => !p.user.equals(userId));

    console.debug('participant=', participant);
    if (!participant) return { statusCode: 404 };
    if (participant.isDone) return { statusCode: 409 };

    const gameLogic = GameModeLookup[lobby.gameMode];
    const guessResult = gameLogic.getGuessResult({
        lobby,
        round: activeRound,
        participant,
        word: guess,
        guessKey,
        timeSpent,
    });
    const didWin = guessResult.mask === '33333';
    const isDone = didWin || !gameLogic.canParticipantGuess({ lobby, participant, offset: 1 });

    console.debug('guessResult=', guessResult, 'isDone=', isDone);
    await db.lobbyAddGuess(lobby.joinKey, activeRound.sequence, userId, guessResult, isDone);

    if (isDone && (otherParticipants.length === 0 || otherParticipants.every(p => p.isDone))) {
        await attemptRoundAdvancement(lobby.joinKey);
    }

    await publishLobbyToAllUsers(lobby.joinKey);

    if (user && isDone && otherParticipants.length > 0) {
        const message = didWin
            ? `Just finished on guess #${guessResult.sequence}! 🎉`
            : `Ran out of guesses and lost 😖`;

        await Promise.all(
            otherParticipants.map(p =>
                publishParticipantDone(p.user, joinKey, activeRound.sequence, userId, user.name, message),
            ),
        );
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ mask: guessResult.mask, score: guessResult.score, isDone }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
};
