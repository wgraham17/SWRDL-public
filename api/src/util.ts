import { ApiGatewayManagementApi } from 'aws-sdk';
import { ObjectId } from 'mongodb';
import getDB from './data';
import { GameModeLookup, LobbyStatus } from './game-logic';
import { Lobby, Participant, Round } from './models';
import { getParticipantStatsForRound } from './stats';

const apig = new ApiGatewayManagementApi({
    endpoint: process.env.WS_DOMAIN,
});

const postToConnection = async <TEventData>(connectionId: string, eventName: string, eventData: TEventData) => {
    const db = await getDB();

    try {
        await apig
            .postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                    event: eventName,
                    data: eventData,
                }),
            })
            .promise();
    } catch {
        await db.userDisconnect(connectionId);
    }
};

export const deleteConnection = async (connectionId: string) => {
    try {
        await apig.deleteConnection({ ConnectionId: connectionId }).promise();
    } catch (err) {
        console.error(err);
    }
};

const getLobbyStatusMessage = (lobby: Lobby, userId: ObjectId): LobbyStatus => {
    if (lobby.hasGameEnded) return 'GAME_ENDED';
    if (!lobby.hasGameStarted || lobby.rounds.length == 0) return 'WAIT_GAME_START';

    const currentRound = lobby.rounds.reduce(
        (prev, curr) => (prev.sequence > curr.sequence ? prev : curr),
        lobby.rounds[0],
    );

    const currentParticipant = currentRound.participants.find(p => p.user.equals(userId));
    if (!currentParticipant) return 'WAIT_NEXT_ROUND';

    const gameLogic = GameModeLookup[lobby.gameMode];
    return gameLogic.getUserRoundStatus({ lobby, round: currentRound, participant: currentParticipant });
};

export const getRoundStatusMessage = (lobby: Lobby, round: Round, participant: Participant): LobbyStatus => {
    const gameLogic = GameModeLookup[lobby.gameMode];
    return gameLogic.getUserRoundStatus({ lobby, round, participant });
};

const getLetterMasksForParticipant = (lobby: Lobby, participant: Participant) => {
    if (lobby.gameMode === 'custom' && lobby.gameRules.maskResult === 'existence') {
        return { correct: [], contained: [] };
    }

    const masks = participant.guesses.reduce(
        (prev, curr) => {
            for (let index = 0; index < curr.mask.length; index++) {
                const mask = curr.mask.charAt(index);
                const char = curr.value.charAt(index).toUpperCase();

                if (mask === '3') {
                    prev.correct.add(char);
                    prev.contained.delete(char);
                } else if (mask === '2') {
                    if (!prev.correct.has(char)) {
                        prev.contained.add(char);
                    }
                }
            }

            return prev;
        },
        { correct: new Set<string>(), contained: new Set<string>() },
    );

    return {
        correct: Array.from(masks.correct),
        contained: Array.from(masks.contained),
    };
};

export const publishLobbyToUser = async (userId: ObjectId, joinKey: string) => {
    const db = await getDB();
    const user = await db.userGet(userId);
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!user || !lobby) return;

    const getUserParticipant = (round: Round) => round.participants.find(p => p.user.equals(userId));
    const isUserDoneWithRound = (round: Round) => !!round.participants.find(p => p.user.equals(userId))?.isDone;
    const isUserNotInRound = (round: Round) => !round.participants.find(p => p.user.equals(userId));

    const shouldShowRoundWord = (round: Round) =>
        !round.active || isUserDoneWithRound(round) || isUserNotInRound(round);

    const shouldShowGuess = (round: Round, participant: Participant) =>
        shouldShowRoundWord(round) || participant.user.equals(userId);

    const getGuesses = (round: Round, participant: Participant) => {
        const result = participant.guesses.map(g => ({
            sequence: g.sequence,
            mask: g.mask,
            score: g.score,
            word: shouldShowGuess(round, participant) ? g.value : null,
            guessKey: g.guessKey,
        }));

        result.sort((a, b) => a.sequence - b.sequence);
        return result;
    };

    const lobbyData = {
        name: lobby.gameMode === 'custom' ? lobby.name : undefined,
        host: lobby.owner.toHexString(),
        joinKey: lobby.joinKey,
        gameMode: lobby.gameMode,
        gameRules: lobby.gameMode === 'custom' ? lobby.gameRules : undefined,
        users: lobby.users?.map(u => ({ id: u })),
        status: getLobbyStatusMessage(lobby, userId),
        rounds: lobby.rounds.map(r => ({
            sequence: r.sequence,
            word: shouldShowRoundWord(r) || getUserParticipant(r)?.shouldProvideWord ? r.word : null,
            active: r.active,
            expectedEndDate: r.expectedEndDate,
            participants: r.participants.map(p => ({
                user: p.user.toHexString(),
                isDone: p.isDone,
                letterMasks: getLetterMasksForParticipant(lobby, p),
                guesses: getGuesses(r, p),
                stats: getParticipantStatsForRound(lobby, r, p.user),
                invalidWords: p.invalidWords,
                shouldProvideWord: !!p.shouldProvideWord,
                word: shouldShowRoundWord(r) || (p.shouldProvideWord && p.user.equals(userId)) ? p.word : undefined,
                status: getRoundStatusMessage(lobby, r, p),
            })),
        })),
    };

    await Promise.all(user.connections.map(c => postToConnection(c, 'lobby', lobbyData)));
};

export const publishLobbyToAllUsers = async (joinKey: string) => {
    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby) return;

    await Promise.all(lobby.users.map(u => publishLobbyToUser(u, joinKey)));
};

export const publishParticipantDone = async (
    recipientUserId: ObjectId,
    joinKey: string,
    roundSequence: number,
    targetUserId: ObjectId,
    userName: string,
    message: string,
) => {
    const db = await getDB();
    const user = await db.userGet(recipientUserId);

    if (!user) return;

    const eventData = { joinKey, roundSequence, targetUserId: targetUserId.toHexString(), userName, message };
    await Promise.all(user.connections.map(c => postToConnection(c, 'participant_done', eventData)));
};

export const publishLobbyRemove = async (userId: ObjectId, joinKey: string) => {
    const db = await getDB();
    const user = await db.userGet(userId);

    if (!user) return;

    const eventData = { joinKey };
    await Promise.all(user.connections.map(c => postToConnection(c, 'lobby_remove', eventData)));
};

export const publishLobbyRemoveToAllUsers = async (joinKey: string) => {
    const db = await getDB();
    const lobby = await db.lobbyGetByJoinKey(joinKey);

    if (!lobby) return;

    await Promise.all(lobby.users.map(u => publishLobbyRemove(u, joinKey)));
};

export const publishNoLobbies = async (userId: ObjectId) => {
    const db = await getDB();
    const user = await db.userGet(userId);

    if (!user) return;

    await Promise.all(user.connections.map(c => postToConnection(c, 'lobby_empty', {})));
};
