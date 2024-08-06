import { SNS } from 'aws-sdk';
import getDB from '../data';
import { GameModeLookup } from '../game-logic';
import { Lobby } from '../models';
import { publishLobbyToAllUsers } from '../util';

const sns = new SNS({
    region: process.env.AWS_REGION,
});

export const checkLobbyForRoundAdvancement = async (lobby: Lobby) => {
    let result = false;
    const db = await getDB();
    const gameLogic = GameModeLookup[lobby.gameMode];
    console.debug(lobby);

    if (gameLogic.isReadyForNextRound(lobby)) {
        console.debug('Determined that ', lobby.joinKey, ' is ready for next round');

        const currentRound = lobby.rounds.reduce(
            (prev, curr) => (prev.sequence > curr.sequence ? prev : curr),
            lobby.rounds[0],
        );

        if (currentRound && currentRound.active) {
            console.debug('A current round exists, ending it now');
            await db.lobbyEndRound(lobby.joinKey, currentRound.sequence);

            result = true;
        }

        if (currentRound.participants.every(p => p.guesses.length === 0)) {
            console.debug('Round ended with no guesses, the game timed out.');
            await db.lobbyEndGame(lobby.joinKey, 'timed-out');

            result = true;
        } else if (gameLogic.isEndOfGame(lobby)) {
            console.debug('Determined that ', lobby.joinKey, ' has ended according to the game rules');
            await db.lobbyEndGame(lobby.joinKey, 'completed');

            result = true;
        } else {
            const nextRound = gameLogic.createRound(lobby);
            console.debug('Saving round', nextRound);
            await db.lobbyAddRound(lobby.joinKey, nextRound);
            await sns
                .publish({
                    Message: JSON.stringify({ joinKey: lobby.joinKey, roundSequence: nextRound.sequence }),
                    TopicArn: process.env.PUSH_NOTIFICATIONS_TOPIC_ARN,
                })
                .promise();

            result = true;
        }
    }

    return result;
};

export const handler = async (): Promise<void> => {
    const db = await getDB();
    const activeLobbies = await db.lobbyListActive();

    console.debug('Getting a list of active lobbies...');

    for (const lobby of activeLobbies) {
        try {
            if (await checkLobbyForRoundAdvancement(lobby)) {
                await publishLobbyToAllUsers(lobby.joinKey);
            }
        } catch (err) {
            console.error('Error while checking for round advancement in', lobby._id.toHexString(), lobby, err);
        }
    }
};
